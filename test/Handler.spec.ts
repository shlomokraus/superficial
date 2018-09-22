const { Application } = require("probot");
import { Handler } from "../src/Handler";
import { Parser } from "../src/Parser";
const pr_sync_payload = require("./mocks/pull_request_open.json");

jest.mock("../src/Parser");
describe("Handler", () => {
  let context, issue, repo;

  describe("getBaseAndHead()", () => {
    beforeEach(() => {
      setupMocks();
    });

    it("Should get file from master and branch", async () => {
      const handler = new Handler(context as any);
      handler.getFileContent = jest
        .fn()
        .mockReturnValue(Promise.resolve("ABC"));
      const files = await handler.getBaseAndHead("test");
      const first = (handler.getFileContent as any).mock.calls[0];
      const second = (handler.getFileContent as any).mock.calls[1];
      expect(first).toEqual(["test", "test-style"]);
      expect(second).toEqual(["test", "master"]);
      expect(files.head).toEqual("ABC");
      expect(files.base).toEqual("ABC");
    });
  });

  describe("compareFiles()", () => {
    it("Should compare files and return true if diff is undefined", () => {
      const handler = new Handler(context as any);

      Parser.diff.mockImplementationOnce(() => undefined);
      const result = handler.compareFiles("source", "target", "test.ts");
      expect(Parser.parse).toBeCalledTimes(2);
      expect(Parser.parse.mock.calls[0]).toEqual(["source", "test.ts"]);
      expect(Parser.parse.mock.calls[1]).toEqual(["target", "test.ts"]);
      expect(result).toEqual(false);
    });

    it("Should false if diff is not undefined", () => {
      const handler = new Handler(context as any);

      Parser.diff.mockImplementationOnce(() => ({}));
      const result = handler.compareFiles("source", "target", "test.ts");
      expect(result).toEqual(true);
    });
  });

  describe("getFiles()", () => {
    beforeEach(() => {
      setupMocks();
    });

    it("Should extract files from pr", async () => {
      const handler = new Handler(context as any);
      const files = await handler.getFiles();
      expect(context.github.pullRequests.getFiles).toHaveBeenCalled();
      expect(files).toHaveLength(2);
      expect(files[0]).toEqual("test.ts");
      expect(files[1]).toEqual("test.js");
    });

    it("Should filter out non relevant extensions", async () => {
      const handler = new Handler(context as any);
      context.github.pullRequests.getFiles = jest.fn().mockReturnValue(
        Promise.resolve({
          data: [{ filename: "allow.ts" }, { filename: "block.exe" }]
        })
      )
      const files = await handler.getFiles();

      expect(files).toEqual(["allow.ts"]);
    });
  });
  
  describe("compileComment()", () => {
    beforeEach(() => {
      setupMocks();
    });

    it("Should filter out non relevant extensions", async () => {
      const handler = new Handler(context as any);
      const files = ["/test.ts", "/test.js"];
      const comment = await handler.compileComment(files);
      expect(comment).toMatchSnapshot();
    });
  });

  describe("updateStatus()", () => {
    beforeEach(() => {
      setupMocks();
    });

    it("Should post status update success", async () => {
      const handler = new Handler(context as any);
      await handler.updateStatus(true);
      expect(context.github.repos.createStatus).toHaveBeenCalled();
      expect(context.github.repos.createStatus.mock.calls[0][0].state).toEqual(
        "success"
      );
    });

    it("Should post status update failure", async () => {
      const handler = new Handler(context as any);
      await handler.updateStatus(false);
      expect(context.github.repos.createStatus).toHaveBeenCalled();
      expect(context.github.repos.createStatus.mock.calls[0][0].state).toEqual(
        "failure"
      );
    });
  });

  const setupMocks = () => {
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
        log: () => {},
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
      pr_sync_payload
    );
  };
});
