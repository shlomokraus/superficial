import { Context } from "probot";
import { PullRequestsGetResponse } from "@octokit/rest";
export declare class GithubHelper {
    private readonly context;
    private readonly pr;
    constructor(context: Context, pr: PullRequestsGetResponse);
    getFileContent(path: string, ref: string): Promise<string>;
    getFile(path: string, ref: string): Promise<any>;
    getFiles(): Promise<string[]>;
    getRef(): Promise<any>;
    getTree(): Promise<any>;
    createBlob(content: string): Promise<import("@octokit/rest").GitdataCreateBlobResponse>;
    createStatus(state: string, description: string): Promise<import("@octokit/rest").ReposCreateStatusResponse>;
    getComments(): Promise<import("@octokit/rest").IssuesGetCommentsResponseItem[]>;
    createComment(body: string): Promise<import("@octokit/rest").IssuesCreateCommentResponse>;
    editComment(body: string, comment_id: string): Promise<import("@octokit/rest").IssuesEditCommentResponse>;
    createCommit(files: {
        path: string;
        content: string;
    }[]): Promise<void>;
}
