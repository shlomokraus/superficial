import { Context } from "probot";

export class Github {
  private readonly context: Context;
  private readonly pr;

  constructor(context: Context, pr) {
    this.context = context;
    this.pr = pr;
  }

  createCommit = async (files: { path: string, content: string}[]) => {

    const context = this.context;
    const github = context.github;
    const issue = context.repo({number: this.pr.number});
    const pr = await github.pullRequests.get(issue);
    const ref = await github.gitdata.getReference(context.repo({ref:"heads/"+pr.data.head.ref}));
    const basetree = await github.gitdata.getTree(
      context.repo({ tree_sha: ref.data.object.sha })
    );
    const blobDict = {} as any;

    await Promise.all(
        files.map(async file => {
        const blob = await github.gitdata.createBlob(
            context.repo({
                number: this.pr.number,
            content: file.content,
            encoding: 'base64'
          }));
          blobDict[file.path] = blob.data.sha;
          return
    }));
    
    /*const tree = basetree.data.tree.map(item => {
        const modified = blobDict[item.path];
        if(modified) {
            return {
                path: item.path,
                mode: "100644",
                type: 'blob',
                sha: modified
              };
        } else {
            return item;
        }
    });*/
    const tree = files.map(function(file, index) {
        return {
          path: file.path,
          mode: "100644",
          type: 'blob',
          sha: blobDict[file.path]
        };
      });

    const newTree = await github.gitdata.createTree(context.repo({
        base_tree: basetree.data.sha,
        tree: tree as any
    }));
      const commit = await github.gitdata.createCommit(context.repo({message: "Removing files that only have style changes", tree: newTree.data.sha, parents: [basetree.data.sha]}));
      await github.gitdata.updateReference(context.repo({number: this.pr.number, sha: commit.data.sha, ref: "heads/"+pr.data.head.ref }));
  };
  
}
