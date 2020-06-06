import { evaluate } from "../src";

describe("errors", () => {
  test.each([
    [
      "throws an error when there are two root nodes",
      `group("foo");concat(["foo"])`,
      "There are two root nodes (1:13)",
    ],
    [
      "throws an error when the root node is not expression statement",
      `{ foo }`,
      "The root node should be ExpressionStatement (1:0)",
    ],
    [
      "throws an error when the invalide node is used",
      `group(1 + 1)`,
      "BinaryExpression is invalid node type (1:6)",
    ],
    [
      "throws an error when the invalid function is called",
      `foo()`,
      "foo is unknown doc builder name (1:0)",
    ],
  ])("%s", (_, source, errorMessage) => {
    expect(() => {
      evaluate(source);
    }).toThrowError(errorMessage);
  });
});
