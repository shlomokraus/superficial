import { Handler } from "./Handler";
import { Application } from 'probot'

const events = [
    "issue_comment.edited",
    "pull_request.opened",
    "check_suite.requested",
    "check_suite.rerequested"
  ];

  export = async (app: Application) => {
  
    app.log("Starting superficial bot");
    app.log("Registering events", events);
    app.on(events, async (context) => {
        let prs;
        if(context.name==="issue_comment" && context.payload.action==="edited"){
            prs = [{number: context.payload.issue.number}];
        }
        else if(context.name==="pull_request" && context.payload.action==="opened"){
            prs = [context.payload.pull_request];
        } else {
            prs = context.payload.check_suite.pull_requests;
        }
        await Promise.all(prs.map(async pr => {
            const handler = new Handler(context);
            return handler.handle(pr.number);
        }))
       
    });

}

