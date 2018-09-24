import { Template, Templates } from "./Template";
import { template } from "lodash";
import { CommentTags, BOT_IDENTIFIER } from "./Constants";
import { GithubHelper } from "./Github";

// const FILE_ITEM_REGEX = /- \[(.)\] (.*)<--file-->\|/g;

export class CommentHelper {
  private readonly githubHelper: GithubHelper;

  constructor(githubHelper) {
    this.githubHelper = githubHelper;
  }

  postComment = async (
    items: { file: string; valid: boolean }[],
    errors: { file: string; error: string }[] = []
  ) => {
    const files = items.map(item => item.file);
    let comment = await this.compileComment(files, errors);

    const existing = await this.getBotMainComment();
    if (existing) {
      if (files.length === 0) {
        comment = this.tagComment(
          Template.get(Templates.updated),
          CommentTags.Main
        );
      }
      await this.githubHelper.editComment(comment, String(existing.id));
    } else {
      if (files.length > 0) {
        await this.githubHelper.createComment(comment);
      }
    }
  };

  postRevertComment = async (files: string[]) => {
    const fileItemsTemplate = Template.get(Templates.fileItem);
    const renderedFiles = files.map(filename =>
      template(fileItemsTemplate)({ filename })
    );
    const commentTemplate = Template.get(Templates.revert);
    let comment = template(commentTemplate)({
      files: renderedFiles.join("\n")
    });

    comment = this.tagComment(comment, CommentTags.Update);
    await this.githubHelper.createComment(comment);
  };

  getBotMainComment = async () => {
    const comments = await this.githubHelper.getComments();
    const filtered = comments.find(comment => {
      const isBot = comment.user.login === BOT_IDENTIFIER;
      if (!isBot) {
        return false;
      }

      const body = comment.body;
      return body.indexOf(CommentTags.Main) >= 0;
    });
    return filtered;
  };

  async compileComment(files: string[], errors: any[]) {
    const fileItemsTemplate = Template.get(Templates.fileItem);
    const renderedFiles = files.map(filename =>
      template(fileItemsTemplate)({ filename })
    );
    const commentTemplate = Template.get(Templates.comment);
    let comment = template(commentTemplate)({
      files: renderedFiles.join("\n")
    });

    const errorCount = errors.length;
    if (errorCount > 0) {
      const errTemplate = Template.get(Templates.errors);
      const errDoc = template(errTemplate)({ errors: errorCount });
      comment = comment + "\n" + errDoc;
    }

    return this.tagComment(comment, CommentTags.Main);
  }

  tagComment(body, commentTag: CommentTags) {
    if (body.indexOf(commentTag) < 0) {
      return body + "\n" + commentTag;
    }
    return body;
  }
}
