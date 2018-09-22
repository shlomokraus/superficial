import { Context } from "probot";
import { Parser } from "./Parser";
import fileExtension from "file-extension";
import { Template, Templates } from "./Template";
import { template } from "lodash";
import { GithubHelper } from "./Github";
import { PullRequestsGetResponse } from "@octokit/rest";


const extensions = ["ts", "js", "tsx", "jsx", "json"];
const botIdentifier = "superficial-bot[bot]";

export class Handler {
  private readonly context: Context;
  private githubHelper!: GithubHelper;
  private pr!: PullRequestsGetResponse;

  constructor(context: Context) {
    this.context = context;
  }

  async handle(prNumber: number) {
    
    // First check if it is comment
    let isComment = this.context.payload.comment;
    let shouldRevert = await this.checkComment();

    // If it is a comment but not a revert request, we got nothing to do here
    if(isComment && !shouldRevert){
        return;
    }

    // Set the PR object
    const pr = await this.context.github.pullRequests.get(
      this.context.repo({ number: prNumber })
    );
    this.pr = pr.data;

    // Initialize Helper
    this.githubHelper = new GithubHelper(this.context, this.pr);

    // Run the check 
    const { problematic, errors } = await this.check();

    // If it is not a revert request, just update status
    if (!shouldRevert) {
      await this.updateStatus(problematic.length === 0);
      await this.postComment(problematic, errors);
    } else {
      const revertPaths = problematic.map(item => item.file);
      const revert = await Promise.all(
        revertPaths.map(async path => this.revertFile(path))
      );
      if (revert.length > 0) {
        await this.githubHelper.createCommit(revert);
        await this.postRevertComment(revert.map(file => file.path));
      }
    }
  }

  async checkComment() {
    const context = this.context;
    if (!this.context.payload.comment) {
      return false;
    }

    if (this.context.payload.comment.user.login !== botIdentifier) {
      return false;
    }

    const changes = context.payload.changes.body;
    if (!changes) {
      return false;
    }

    const before = changes.from;
    const after = context.payload.comment.body;

    const beforeCheck = before.indexOf("- [ ] Remove selected files") >= 0;
    const afterCheck = after.indexOf("- [x] Remove selected files") >= 0;

    return beforeCheck && afterCheck;
  }

  async check() {
    let files = await this.githubHelper.getFiles();
    files = this.filterFiles(files);

    const results = await Promise.all(
      files.map(async file => this.parseFile(file))
    );
    const problematic = results.filter(result => !result.valid);
    const errors = results.filter(result => result.error);
    return { problematic, errors };
  }

  parseFile = async (file: string) => {
    let valid = true;
    let error;

    try {
      const content = await this.getBaseAndHead(file);
      // If we don't have base, that is a new file so it is valid
      valid =
        content.base && content.head
          ? this.compareFiles(content.head, content.base, file)
          : true;
    } catch (ex) {
      this.context.log.error("Unable to parse file", ex);
      error = true;
    }

    return { file, valid, error };
  };

  revertFile = async (path: string) => {
    const base = this.pr.base.ref;
    const source = await this.githubHelper.getFile(path, base);
    return { path, content: source.content };
  };

  postRevertComment = async (files: string[]) => {
    const fileItemsTemplate = await Template.get(Templates.fileItem);
    const renderedFiles = files.map(filename =>
      template(fileItemsTemplate)({ filename })
    );
    const commentTemplate = await Template.get(Templates.revert);
    const comment = template(commentTemplate)({
      files: renderedFiles.join("\n")
    });
    await this.context.github.issues.createComment(
      this.context.repo({ number: this.pr.number, body: comment })
    );
  };

  postComment = async (
    items: { file: string; valid: boolean }[],
    errors: { file: string; error: string }[] = []
  ) => {
    const context = this.context;
    const files = items.map(item => item.file);
    let comment = await this.compileComment(files, errors);

    const existing = await this.getExistingComment();
    if (existing) {
      await context.github.issues.editComment(
        context.repo({
          number: this.pr.number,
          body: await Template.get(Templates.updated),
          comment_id: String(existing.id)
        })
      );
    } else {
      if (files.length > 0) {
        await context.github.issues.createComment(
          context.repo({ number: this.pr.number, body: comment })
        );
      }
    }
  };

  getExistingComment = async () => {
    const comments = await this.context.github.issues.getComments(
      this.context.repo({ number: this.pr.number })
    );
    const filtered = comments.data.find(comment => {
      const isBot = comment.user.login === botIdentifier;
      if (!isBot) {
        return false;
      }

      const body = comment.body;
      return body.indexOf("be superficial!") >= 0;
    });
    return filtered;
  };

  async compileComment(files: string[], errors: any[]) {
    const fileItemsTemplate = await Template.get(Templates.fileItem);
    const renderedFiles = files.map(filename =>
      template(fileItemsTemplate)({ filename })
    );
    const commentTemplate = await Template.get(Templates.comment);
    let comment = template(commentTemplate)({
      files: renderedFiles.join("\n")
    });

    const errorCount = errors.length;
    if (errorCount > 0) {
      const errTemplate = await Template.get(Templates.errors);
      const errDoc = template(errTemplate)({ errors: errorCount });
      comment = comment + "\n" + errDoc;
    }
    return comment;
  }

  compareFiles(source: string, target: string, filename: string) {
    const left = Parser.parse(source, filename);
    const right = Parser.parse(target, filename);
    const diff = Parser.diff(left, right, ["loc", "start", "end"]);
    return diff !== undefined;
  }

  updateStatus = async (success: boolean) => {
    const { head } = this.pr;

    const state = success ? "success" : "failure";

    function getDescription() {
      if (success) return "ready to merge";
      return "superficial changes not allowed";
    }

    let status = {
      sha: head.sha,
      state,
      description: getDescription(),
      context: "Superficial"
    };
    await this.context.github.repos.createStatus(this.context.repo(
      status
    ) as any);
  };

  getBaseAndHead = async (path: string) => {
    let head;
    let base;
    try {
      const headRef = this.pr.head.ref;
      head = await this.githubHelper.getFileContent(path, headRef);
      const baseRef = this.pr.base.ref;
      base = await this.githubHelper.getFileContent(path, baseRef);
    } catch (ex) {
      ex = ex;
    }

    return { head, base };
  };

  filterFiles(files: string[]) {
    return files.filter(file => {
      const ext = fileExtension(file);
      return extensions.indexOf(ext) >= 0;
    });
  }
}
