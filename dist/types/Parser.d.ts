export declare class Parser {
    static parse(src: string, filename: string, prettier?: boolean): any;
    static prepare(src: string, options: any): any;
    static diff(src: any, target: any, ignoreKeys?: string[]): any;
    static flatten(obj: any): any;
}
