import path from "path";
import fs from "fs";

export enum Templates {
  comment = "comment.md",
  updated = "updated.md",
  revert = "revert.md",
  fileItem = "file-item.md",
  errors = "errors.md"
}

export class Template {
  static get(template: Templates) {
    const file = path.resolve(`./src/templates/${template}`);
    const str = fs.readFileSync(file, "utf8");
    return str;
  }
}
