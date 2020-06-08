import { evaluate } from "../src";

describe("evaluate", () => {
  test.each([
    [
      "prints docs with group, concat",
      `group(concat(["foo", line, "bar"]))`,
      "foo bar",
    ],
    ["prints docs with fill", `fill(["foo", line, "bar", line])`, "foo bar "],
    [
      "prints docs with conditionalGroup",
      `conditionalGroup([concat(["foo", line]), "bar"])`,
      "foo ",
    ],
    [
      "prints docs with indent, dedent",
      `indent(dedent("foo"))`,
      "foo"
    ],
    [
      "prints docs with lineSuffix",
      `concat(["foo", lineSuffix("bar"), hardline])`,
      "foobar\n"
    ],
    [
      "prints docs with markAsRoot",
      `markAsRoot("foo")`,
      "foo",
    ],
    [
      "prints docs with dedentToRoot",
      `dedentToRoot("foo")`,
      "foo"
    ],
    [
      "pritns docs with join",
      `join("xxx", ["foo", "bar", "baz"])`,
      "fooxxxbarxxxbaz"
    ],
    [
      "prints docs with ifBreak (no break)",
      `concat(["foo", ifBreak("bar", "baz")])`,
      "foobar"
    ],
    [
      "prints docs with ifBreak (break)",
      `group(concat(["foo", ifBreak("bar", "baz"), breakParent]))`,
      "foobaz"
    ],
  ])("%s", (_, source, formatted) => {
    const result = evaluate(source);
    expect(result).toBe(formatted);
  });
});
