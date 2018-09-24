import { Handler } from "../src/Handler";
import { GithubHelper } from "../src/Github";
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

  describe("check()", () => {

    it("Should retrieve list of files, parse and return result", async () => {
      setupMocks({});
      const handler = new Handler(context, prMock);
      GithubHelper.mock.instances[0].getFiles.mockImplementationOnce(async () => (["file1.ts", "file2.js", "file3.exe"]));
      handler.parseFile = jest.fn().mockResolvedValue({valid: false })
      const result = await handler.check();

      expect(handler.parseFile).toBeCalledTimes(2);
      expect(handler.parseFile.mock.calls[0][0]).toEqual("file1.ts");
      expect(handler.parseFile.mock.calls[1][0]).toEqual("file2.js");
      expect(result).toEqual({problematic: [{valid: false},{valid: false}], errors: []})
    })

  })

  describe("parseFile()", () => {

    it("Should get content for files and pass to comparer", async () => {
      setupMocks({});
      const handler = new Handler(context, prMock);
      GithubHelper.mock.instances[0].getFileContent.mockImplementation(async () => ("CONTENT"));
      handler.compareFiles = jest.fn().mockReturnValue(false)
      
      const result = await handler.parseFile("File");
      
      expect(handler.compareFiles).toBeCalledWith("CONTENT", "CONTENT", "File");
      expect(result).toEqual({file: "File", valid: false, error: undefined})
    })
  })

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
