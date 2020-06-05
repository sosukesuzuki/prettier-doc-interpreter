import { evaluate } from "../src";

describe("evaluate", () => {
  test("foo", () => {
    const source = `
          group(concat(["foo", line, "bar"]));
        `;
    const result = evaluate(source);
    expect(result).toBe(source);
  });
});
