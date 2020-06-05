import { evaluate } from "../src";

describe("evaluate", () => {
  test("throws an error when there are two root nodes", () => {
    const source = `
      group("foo");
      concat(["foo"]);
    `;
    expect(() => {
      evaluate(source);
    }).toThrow();
  });

  test("throws an error when the root node is not expression statement", () => {
    const source = `
        { "foo" }
      `;
    expect(() => {
      evaluate(source);
    }).toThrow();
  });
});
