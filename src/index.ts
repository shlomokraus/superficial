import { Handler } from "./Handler";
import { Application } from "probot";
import { Analytics } from "./Analytics";
import { AnalyticEvents } from "./Constants";

const events = [
  "issue_comment.edited",
  "pull_request.opened",
  "check_suite.requested",
  "check_suite.rerequested"
];

const UA_ID = process.env.UA_ID;

export = async (app: Application) => {
  app.log("Starting superficial bot");
  app.log("Registering events", events);

  const analytics = new Analytics(UA_ID);
  analytics.event(AnalyticEvents.AppStarted, "ok")
 
  // Register events
  app.on(events, async context => {
    analytics.set("uid", context.payload.installation.id);
    analytics.event(AnalyticEvents.Webhook, context.name);

    // Not all payloads have the pr object so we need to prepare it
    let prs = await extractPrs(context);

    await Promise.all(
      prs.map(async pr => {
        const handler = new Handler(context, pr, analytics);
        return handler.handle();
      })
    );
  });

  // Serve static content
  const router = app.route("/");
  router.use(require("express").static("static"));
};

async function extractPrs(context) {
  let prs: any[] = [];
  const event = context.name ? context.name : context.event;
  if (event === "issue_comment" && context.payload.action === "edited") {
    prs = [await retrievePr(context, context.payload.issue.number)];
  } else if (event === "pull_request" && context.payload.action === "opened") {
    prs = [context.payload.pull_request];
  } else {
    prs = context.payload.check_suite.pull_requests;
  }
  return prs;
}

async function retrievePr(context, number) {
  const pr = await context.github.pullRequests.get(context.repo({ number }));
  return pr.data;
}
