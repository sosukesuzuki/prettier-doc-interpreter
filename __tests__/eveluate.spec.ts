import { evaluate } from "../src";

describe("evaluate", () => {
  test.each([
    [
      "throws an error when there are two root nodes",
      `group("foo");concat(["foo"])`,
    ],
    [
      "throws an error when the root node is not expression statement",
      `{ foo }`,
    ],
    ["throws an error when the invalide node is used", `foo(1 + 1)`],
    ["throws an error when the invalid function is called", `foo()`],
  ])("%s", (_, source) => {
    expect(() => {
      evaluate(source);
    }).toThrow();
  });
});
