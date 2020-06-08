import { evaluate } from "../src";

describe("evaluate", () => {
  test.each([
    [
      "prints docs with group, concat",
      `group(concat(["foo", line, "bar"]))`,
      "foo bar",
    ],
    ["prints docs with fill", `fill(["foo", line, "bar", line])`, "foo bar "],
  ])("%s", (_, source, formatted) => {
    const result = evaluate(source);
    expect(result).toBe(formatted);
  });
});
