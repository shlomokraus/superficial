/**
 * Stores metadata in PR comments, extracted from metadata bot
 * https://github.com/probot/metadata/blob/master/index.js
 */
export declare class Persist {
    github: any;
    context: any;
    prefix: any;
    issue: any;
    constructor(context: any, issue?: any);
    get(key: any): Promise<any>;
    set(key: any, value: any): Promise<any>;
}
