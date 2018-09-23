import { Context } from "probot";
import { PullRequestsGetResponse } from "@octokit/rest";
import { CommentTags } from "./Constants";
export declare class Handler {
    private readonly context;
    private githubHelper;
    private pr;
    private persist;
    private readonly logger;
    constructor(context: Context, pr: PullRequestsGetResponse);
    /**
     * Main entry point
     */
    handle(): Promise<void>;
    handleCommentEdit(): Promise<void>;
    handleCheckStatus(): Promise<void>;
    checkComment(): Promise<boolean>;
    check(): Promise<{
        problematic: {
            file: string;
            valid: boolean;
            error: any;
        }[];
        errors: {
            file: string;
            valid: boolean;
            error: any;
        }[];
    }>;
    parseFile: (file: string) => Promise<{
        file: string;
        valid: boolean;
        error: any;
    }>;
    revertFile: (path: string) => Promise<{
        path: string;
        content: any;
    }>;
    postRevertComment: (files: string[]) => Promise<void>;
    postComment: (items: {
        file: string;
        valid: boolean;
    }[], errors?: {
        file: string;
        error: string;
    }[]) => Promise<void>;
    getBotMainComment: () => Promise<import("@octokit/rest").IssuesGetCommentsResponseItem | undefined>;
    compileComment(files: string[], errors: any[]): Promise<any>;
    compareFiles(source: string, target: string, filename: string): boolean;
    updateStatus: (success: boolean) => Promise<void>;
    getBaseAndHead: (path: string) => Promise<{
        head: any;
        base: any;
    }>;
    filterFiles(files: string[]): string[];
    /**
     * Tag comment with metadata
     */
    tagComment(body: any, commentTag: CommentTags): any;
}
