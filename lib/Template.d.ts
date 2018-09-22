export declare enum Templates {
    comment = "comment.md",
    revert = "revert.md",
    fileItem = "file-item.md",
    errors = "errors.md"
}
export declare class Template {
    static get(template: Templates): Promise<string>;
}
