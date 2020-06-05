import { evaluate } from "../src";

describe("evaluate", () => {
  test("prints docs", () => {
    const source = `
          group(concat(["foo", line, "bar"]));
        `;
    const result = evaluate(source);
    expect(result).toBe("foo bar");
  });
});
