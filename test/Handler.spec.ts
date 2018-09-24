const { Application } = require("probot");
import { Handler } from "../src/Handler";
import { Parser } from "../src/Parser";
const prOpenMock = require("./mocks/pull_request_open.json");
const prMock = require("./mocks/getPullRequest.json");
const issueCommentEditedMock = require("./mocks/issue_comment_edited.json");
const checkSuiteRequestedMock = require("./mocks/check_suite_requested.json");

jest.mock("../src/Parser");
jest.mock("../src/Github");
jest.mock("../src/Persist");

describe("Handler", () => {
  let context, issue, repo;

  describe("handler()", () => {
    it("Should handle check status request", async () => {
      setupMocks(checkSuiteRequestedMock);
      const handler = new Handler(context, prMock);
      handler.handleCheckStatus = jest.fn();
      await handler.handle();
      expect(handler.handleCheckStatus).toBeCalled();
    });

    it("Should handle comment edit", async () => {
      setupMocks(issueCommentEditedMock);
      const handler = new Handler(context, prMock);
      handler.handleCommentEdit = jest.fn();
      await handler.handle();
      expect(handler.handleCommentEdit).toBeCalled();
    });
  });

  const setupMocks = basePayload => {
    jest.clearAllMocks();
    issue = {
      owner: "tet",
      repo: "testing",
      number: 42
    };
    repo = {
      owner: "test",
      repo: "testing"
    };
    context = Object.assign(
      {
        log: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
        repo: val => Object.assign(val, repo),
        github: {
          repos: {
            createStatus: jest.fn().mockReturnValue(Promise.resolve({}))
          },
          pullRequests: {
            getFiles: jest.fn().mockReturnValue(
              Promise.resolve({
                data: [{ filename: "test.ts" }, { filename: "test.js" }]
              })
            )
          }
        },
        issue: () => issue
      },
      basePayload
    );
  };
});
