import path from "path";
import fs from "fs"

export enum Templates {
    comment = "comment.md",
    revert = "revert.md",
    fileItem = "file-item.md",
    errors = "errors.md"
}

export class Template {
  
  static async get(template: Templates) {
    const file = path.resolve(`./src/templates/${template}`)
    const str = fs.readFileSync(file,  "utf8");
    return str;
  }
}
