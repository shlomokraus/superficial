import { Context } from "probot";
export declare class Github {
    private readonly context;
    private readonly pr;
    constructor(context: Context, pr: any);
    createCommit: (files: {
        path: string;
        content: string;
    }[]) => Promise<void>;
}
