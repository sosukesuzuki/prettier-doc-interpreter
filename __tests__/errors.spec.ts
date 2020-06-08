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
      "throws an error when an invalid node is used",
      `group(1 + 1)`,
      "BinaryExpression is invalid node type (1:6)",
    ],
    [
      "throws an error when an invalid doc builder function is called",
      `foo()`,
      "foo is unknown doc builder function name (1:0)",
    ],
    [
      "throws an error when an invalid doc builder value is called",
      `concat([foo])`,
      "foo is unknown doc builder value name (1:8)",
    ],
    [
      "throws an error when there is an literal that isn't string",
      `concat([3])`,
      "A Literal should be string (1:8)",
    ],
    [
      "throws an error when group argument is an array",
      `group(["foo"])`,
      "group argument shouldn't be an array",
    ],
    [
      "throws an error when concat argument is a not-array",
      `concat("foo")`,
      "concat argument should be an array"
    ],
    [
      "throws an error when there is array in array",
      `concat(["foo", ["bar"]])`,
      "A node in an array shouldn't be array (1:15)"
    ]
  ])("%s", (_, source, errorMessage) => {
    expect(() => {
      evaluate(source);
    }).toThrowError(errorMessage);
  });
});
