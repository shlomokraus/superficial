const { Application } = require("probot");
import superficial from "../src";
import { Handler } from "../src/Handler";

jest.mock("../src/Handler");

describe("Superficial Probot", () => {
  let app, github;

  beforeEach(() => {
    app = new Application();
    app.load(superficial);
    app.auth = () => Promise.resolve({});
  });

  it("Should call handler on relevant events", async () => {
    const events = [
      "pull_request.opened",
      "pull_request.edited",
      "pull_request.synchronize"
    ];
    const result = await Promise.all(
      events.map(async event => {
        await app.receive({
          name: event,
          payload: {}
        });
      })
    );
    const instances = Handler.mock.instances;
    expect(instances).toHaveLength(3);
  });
});
