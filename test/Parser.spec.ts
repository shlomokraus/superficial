import { Parser } from "../src/Parser";

describe("Parser", () => {
  const src = `
    class Hello {
      a: boolean
      b: boolean
  
      render() {
          this.a = false;
          this.b = false;
          function a() {}
      }
    }
  `;

  describe("parse()", () => {
    it("Should parse source", () => {
      const parsed = Parser.parse(src, "test.ts");
      expect(parsed).toMatchSnapshot();
    });
  });

  describe("diff()", () => {
    it("Should not diff identical sources", () => {
      const parsed = Parser.parse(src, "test.ts");
      const diff = Parser.diff(parsed, parsed);
      expect(diff).toEqual(undefined);
    });

    it("Should diff non-identical sources", () => {
      const left = { a: 1 };
      const right = { a: 2 };
      const diff = Parser.diff(left, right);
      expect(diff).toEqual({ a: [1, 2] });
    });

    it("Should ignore keys", () => {
      const left = { a: 1, ignore: 1 };
      const right = { a: 2 };
      const before = Parser.diff(left, right);
      expect(before).toHaveProperty("ignore");
      const after = Parser.diff(left, right, ["ignore"]);
      expect(after).not.toHaveProperty("ignore");
    });
  });


});
