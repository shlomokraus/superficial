import { Context } from "probot";
import { PullRequestsGetResponse } from "@octokit/rest";



export class GithubHelper {
  private readonly context: Context;
  private readonly pr: PullRequestsGetResponse;

  constructor(context: Context, pr: PullRequestsGetResponse) {
    this.context = context;
    this.pr = pr;
  }

  async getFileContent  (path: string, ref: string) {
    const result = await this.getFile(path, ref);
    const content = Buffer.from(result.content, "base64").toString();
    return content;
  };

  async getFile(path: string, ref: string) {
    const repo = this.context.repo({ path, ref });
    const result = await this.context.github.repos.getContent(repo);
    return result.data;
  };

  async getFiles  () {
    const compare = await this.context.github.repos.compareCommits(
      this.context.repo({
        base: this.pr.base.sha,
        head: this.pr.head.sha
      })
    );

    const files = compare.data.files
      .filter(file => file.status === "modified")
      .map(file => file.filename);
    return files as string[];
  };

  async getRef  () {
    const ref = await this.context.github.gitdata.getReference(
      this.context.repo({ ref: "heads/" + this.pr.head.ref })
    );
    return ref.data;
  };

  async getTree  () {
    const ref = await this.getRef();
    const tree = await this.context.github.gitdata.getTree(
      this.context.repo({ tree_sha: ref.object.sha })
    );
    return tree.data;
  };

  async createBlob  (content: string) {
    const blob = await this.context.github.gitdata.createBlob(
      this.context.repo({
        number: this.pr.number,
        content,
        encoding: "base64"
      })
    );
    return blob.data;
  };

  async createStatus  (state: string, description: string) {
    const { head } = this.pr;

    let status = {
      sha: head.sha,
      state,
      description,
      context: "Superficial"
    };
    const result = await this.context.github.repos.createStatus(
      this.context.repo(status) as any
    );
    return result.data;
  };

  async getComments  () {
    const comments = await this.context.github.issues.getComments(
      this.context.repo({ number: this.pr.number })
    );
    return comments.data;
  };

  async createComment  (body: string) {
    const result = await this.context.github.issues.createComment(
      this.context.repo({ number: this.pr.number, body })
    );
    return result.data;
  };

  async editComment  (body: string, comment_id: string) {
    const result = await this.context.github.issues.editComment(
      this.context.repo({
        number: this.pr.number,
        body,
        comment_id
      })
    );

    return result.data;
  };

  async createCommit  (files: { path: string; content: string }[]) {
    const context = this.context;
    const github = context.github;

    const basetree = await this.getTree();
    const blobDict = {} as any;

    await Promise.all(
      files.map(async file => {
        const blob = await this.createBlob(file.content);
        blobDict[file.path] = blob.sha;
        return;
      })
    );

    const tree = files.map(function(file, index) {
      return {
        path: file.path,
        mode: "100644",
        type: "blob",
        sha: blobDict[file.path]
      };
    });

    const newTree = await github.gitdata.createTree(
      context.repo({
        base_tree: basetree.sha,
        tree: tree as any
      })
    );
    const commit = await github.gitdata.createCommit(
      context.repo({
        message: `Reverting changes of ${
          files.length
        } files that only had formatting changes`,
        tree: newTree.data.sha,
        parents: [basetree.sha]
      })
    );
    await github.gitdata.updateReference(
      context.repo({
        number: this.pr.number,
        sha: commit.data.sha,
        ref: "heads/" + this.pr.head.ref
      })
    );
  };
}
