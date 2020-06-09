import type { Doc } from "prettier";

function assertDoc(val: Doc): asserts val is Doc {
  if (
    !(typeof val === "string" || (val != null && typeof val.type === "string"))
  ) {
    throw new Error(
      "Value " + JSON.stringify(val) + " is not a valid document"
    );
  }
}

export function concat(parts: Doc[]): Doc {
  for (const part of parts) {
    assertDoc(part);
  }
  return { type: "concat", parts };
}

export function indent(contents: Doc): Doc {
  assertDoc(contents);
  return { type: "indent", contents };
}

export function align(n: number, contents: Doc): Doc {
  assertDoc(contents);
  return { type: "align", contents, n };
}

export const lineSuffixBoundary: Doc = { type: "line-suffix-boundary" };
export const breakParent: Doc = { type: "break-parent" };
// export const trim: Doc = { type: "trim" };
export const line: Doc = { type: "line" };
export const softline: Doc = { type: "line", soft: true };
export const hardline: Doc = concat([
  { type: "line", hard: true },
  breakParent,
]);
export const literalline: Doc = concat([
  { type: "line", hard: true, literal: true },
  breakParent,
]);
// export const cursor: Doc = { type: "cursor", placeholder: Symbol("cursor") };

export function group(
  contents: Doc,
  opts: { shouldBreak: boolean; expandedStates: any } = {
    shouldBreak: false,
    expandedStates: undefined,
  }
): Doc {
  assertDoc(contents);

  return {
    type: "group",
    contents,
    break: !!opts.shouldBreak,
    expandedStates: opts.expandedStates,
  };
}

export function conditionalGroup(states: Doc[], opts?: any) {
  return group(states[0], { ...opts, expandedStates: states });
}

export function join(sep: Doc, arr: Doc[]): Doc {
  const res = [];

  for (let i = 0; i < arr.length; i++) {
    if (i !== 0) {
      res.push(sep);
    }

    res.push(arr[i]);
  }

  return concat(res);
}

export function dedentToRoot(contents: Doc): Doc {
  return align(-Infinity, contents);
}

export function markAsRoot(contents: Doc): Doc {
  // @ts-ignore - TBD ???:
  return align({ type: "root" }, contents);
}

export function dedent(contents: Doc): Doc {
  return align(-1, contents);
}

export function fill(parts: Doc[]): Doc {
  parts.forEach(assertDoc);
  return { type: "fill", parts };
}

export function ifBreak(breakContents: Doc, flatContents: Doc): Doc {
  if (breakContents) {
    assertDoc(breakContents);
  }
  if (flatContents) {
    assertDoc(flatContents);
  }
  return {
    type: "if-break",
    breakContents,
    flatContents,
  };
}

export function lineSuffix(contents: Doc): Doc {
  assertDoc(contents);
  return { type: "line-suffix", contents };
}
