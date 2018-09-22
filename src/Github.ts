import { Context } from "probot";
import { PullRequestsGetResponse } from "@octokit/rest";

export class GithubHelper
 {
  private readonly context: Context;
  private readonly pr: PullRequestsGetResponse;

  constructor(context: Context, pr: PullRequestsGetResponse) {
    this.context = context;
    this.pr = pr;
  }
  
  getFileContent = async (path: string, ref: string) => {
        const result = await this.getFile(path, ref);
        const content = Buffer.from(result.content, "base64").toString();
        return content;
      };
  

  getFile = async (path: string, ref: string) => {
    const repo = this.context.repo({ path, ref });
    const result = await this.context.github.repos.getContent(repo);
    return result.data;
  };
  
  getFiles = async () => {
    const compare = await this.context.github.repos.compareCommits(this.context.repo({
        base: this.pr.base.sha,
        head: this.pr.head.sha
      }));

    const files = compare.data.files.filter(file=>file.status==="modified").map(file => file.filename);
    return files as string[];
  };

  getRef = async () => {
      const ref = await this.context.github.gitdata.getReference(this.context.repo({ref:"heads/"+this.pr.head.ref}));
      return ref.data;
  }

  getTree = async () => {
      const ref = await this.getRef();
      const tree = await this.context.github.gitdata.getTree(
        this.context.repo({ tree_sha: ref.object.sha })
      );
      return tree.data;
  }

  createBlob = async (content: string) => {
    const blob = await this.context.github.gitdata.createBlob(
        this.context.repo({
            number: this.pr.number,
        content,
        encoding: 'base64'
      }));
      return blob.data;
  };

  createCommit = async (files: { path: string, content: string}[]) => {

    const context = this.context;
    const github = context.github;

    const basetree = await this.getTree();
    const blobDict = {} as any;

    await Promise.all(
        files.map(async file => {
        const blob = await this.createBlob(file.content);
          blobDict[file.path] = blob.sha;
          return
    }));
    
    const tree = files.map(function(file, index) {
        return {
          path: file.path,
          mode: "100644",
          type: 'blob',
          sha: blobDict[file.path]
        };
      });

    const newTree = await github.gitdata.createTree(context.repo({
        base_tree: basetree.sha,
        tree: tree as any
    }));
      const commit = await github.gitdata.createCommit(context.repo({message: "Removing files that only have style changes", tree: newTree.data.sha, parents: [basetree.sha]}));
      await github.gitdata.updateReference(context.repo({number: this.pr.number, sha: commit.data.sha, ref: "heads/"+this.pr.head.ref }));
  };
  
}
