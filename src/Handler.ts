import { Context, Logger } from "probot";
import { Parser } from "./Parser";
import fileExtension from "file-extension";
import { GithubHelper } from "./Github";
import { PullRequestsGetResponse } from "@octokit/rest";
import { Persist } from "./Persist";
import { CommentHelper } from "./Comment";

import {
  BOT_IDENTIFIER,
  VALID_EXTENSIONS,
  SCRIPT_EXTENSIONS
} from "./Constants";
import { Analytics } from "./Analytics";
import { AnalyticEvents } from "./Constants";

export class Handler {
  private readonly context: Context;
  private githubHelper!: GithubHelper;
  private commentHelper!: CommentHelper;
  private pr: PullRequestsGetResponse;
  private persist!: Persist;
  private readonly logger: Logger;
  private readonly analytics: Analytics;

  constructor(
    context: Context,
    pr: PullRequestsGetResponse,
    analytics: Analytics
  ) {
    this.context = context;
    this.logger = context.log;
    this.pr = pr;
    this.analytics = analytics;

    this.githubHelper = new GithubHelper(this.context, pr);
    this.commentHelper = new CommentHelper(this.githubHelper);
    this.persist = new Persist(
      this.context,
      this.context.repo({ number: pr.number })
    );
  }

  /**
   * Main entry point
   */
  async handle() {
    try {
      const event = this.context.name ? this.context.name : this.context.event;

      this.analytics.event(
        event,
        this.context.payload.action,
        "pr",
        this.pr.number
      );
      this.logger.info(
        "Handling action " + event + " for pr " + this.pr.number
      );

      if (
        event === "issue_comment" &&
        this.context.payload.action === "edited"
      ) {
        return this.handleCommentEdit();
      } else {
        return this.handleCheckStatus();
      }
    } catch (ex) {
      this.analytics.exception(ex.message);
    }
  }

  async handleCommentEdit() {
    let shouldRevert = await this.checkComment();
    if (!shouldRevert) {
      this.logger.info("Comment is not a revert request");
      return;
    }

    this.logger.info("Reverting files");
    let files = (await this.persist.get("files")) as any[];

    if (!files) {
      this.logger.info("No files in metada: ", files);
    }
    this.logger.debug("Got files from metadata: ", files);

    try {
      files = JSON.parse(files as any);
    } catch (ex) {
      this.logger.error("Error while parsing files to json", ex);
    }
    const revertPaths = files.map(item => item.file);
    const revert = await Promise.all(
      revertPaths.map(async path => this.revertFile(path))
    );

    if (revert.length > 0) {
      this.analytics.event(AnalyticEvents.RevertDone, files.length);

      this.logger.info("Creating commit");
      await this.githubHelper.createCommit(revert);
      this.logger.info("Posting revert comment");
      await this.commentHelper.postRevertComment(revert.map(file => file.path));
      await this.persist.set("files", undefined);
    }
  }

  async handleCheckStatus() {
    this.logger.info("Starting check run");

    const { problematic, errors } = await this.check();

    this.logger.info(
      "Check completed with " +
        problematic.length +
        " files and " +
        errors.length +
        " errors"
    );
    this.analytics.event(
      AnalyticEvents.Check,
      problematic.length,
      "errors",
      errors.length
    );

    this.logger.info("Updating pr status");
    await this.updateStatus(problematic.length === 0);

    this.logger.info("Posting comment");
    await this.commentHelper.postComment(problematic, errors);

    if (problematic.length > 0) {
      const payload = JSON.stringify(problematic);
      this.logger.info("Storing metadata", payload);
      await this.persist.set("files", payload);
    }
  }

  async checkComment() {
    this.logger.info("Checking comment...");

    const context = this.context;
    if (!this.context.payload.comment) {
      this.logger.info("No comment payload");
      return false;
    }

    if (this.context.payload.comment.user.login !== BOT_IDENTIFIER) {
      this.logger.info("Comment is not owned by bot");
      return false;
    }

    const changes = context.payload.changes.body;
    if (!changes) {
      this.logger.info("No changes to comment body");
      return false;
    }

    const before = changes.from;
    const after = context.payload.comment.body;

    const beforeCheck = before.indexOf("- [x] Remove selected files") < 0;
    const afterCheck = after.indexOf("- [x] Remove selected files") >= 0;

    this.logger.debug("Before and after check:", beforeCheck, afterCheck);

    return beforeCheck && afterCheck;
  }

  async check() {
    this.logger.info("Getting files");
    let files = await this.githubHelper.getFiles();

    this.logger.info("Got " + files.length + " in pull request");
    this.logger.debug(JSON.stringify(files));
    files = this.filterFiles(files);
    this.logger.info("Got " + files.length + " relevant files after filter");

    const results = await Promise.all(
      files.map(async file => this.parseFile(file))
    );
    this.logger.info("Finished parsing files, preparing results");

    const problematic = results.filter(result => !result.valid);
    const errors = results.filter(result => result.error);
    return { problematic, errors };
  }

  parseFile = async (file: string) => {
    let valid = true;
    let error;

    try {
      const content = await this.getBaseAndHead(file);
      // If we don't have base or head then the file changes are real
      valid =
        content.base && content.head
          ? this.compareFiles(content.head, content.base, file)
          : true;
    } catch (ex) {
      this.logger.error("Unable to parse file", ex);
      error = true;
    }

    return { file, valid, error };
  };

  revertFile = async (path: string) => {
    const base = this.pr.base.ref;
    const source = await this.githubHelper.getFile(path, base);
    return { path, content: source.content };
  };

  compareFiles(source: string, target: string, filename: string) {
    this.logger.info("Comparing file " + filename);

    const ext = fileExtension(filename);
    const isScript = SCRIPT_EXTENSIONS.indexOf(ext) >= 0;

    const left = isScript
      ? Parser.parse(source, filename)
      : Parser.prepare(source, { filepath: filename });
    const right = isScript
      ? Parser.parse(target, filename)
      : Parser.prepare(target, { filepath: filename });
    const diff = Parser.diff(left, right, ["loc", "start", "end"]);
    this.logger.debug("Result is ", diff);

    return diff !== undefined;
  }

  async updateStatus(success: boolean) {
    const state = success ? "success" : "failure";
    this.logger.info("Updating status to " + state);
    const message = success
      ? "ready to merge"
      : "superficial changes not allowed";
    await this.githubHelper.createStatus(state, message);
  }

  async getBaseAndHead(path: string) {
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
  }

  filterFiles(files: string[]) {
    return files.filter(file => {
      const ext = fileExtension(file);
      return VALID_EXTENSIONS.indexOf(ext) >= 0;
    });
  }
}
