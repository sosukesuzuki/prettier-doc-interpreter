import { evaluate } from "../src";

describe("evaluate", () => {
  test("code is code", () => {
    const source = "foo";
    const result = evaluate(source);

    expect(result).toBe(source);
  });
});
