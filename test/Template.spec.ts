import { Template, Templates } from "../src/Template";

describe("Template", () => {
  it("Should load template file", async () => {
    const str = await Template.get(Templates.comment);
    expect(str).toMatchSnapshot();
  });
});
