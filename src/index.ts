import { Handler } from "./Handler";
import { Application } from 'probot'

const events = [
    "pull_request.opened",
    "check_suite.requested",
    "check_suite.rerequested"
  ];

  export = async (app: Application) => {
  
    app.log("Starting superficial bot");
    app.log("Registering events", events);
    app.on(events, async (context) => {
        let prs;
        if(context.name==="pull_request" && context.payload.action==="opened"){
            prs = [context.payload.pull_request];
        } else {
            prs = context.payload.check_suite.pull_requests;
        }
        await Promise.all(prs.map(async pr => {
            const handler = new Handler(context, pr);
            return handler.handle();
        }))
       
    });

}

