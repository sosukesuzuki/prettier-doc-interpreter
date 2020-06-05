import { parse } from "acorn";
import espurify from "espurify";
import type ESTree from "estree";

export function evaluate(code: string): string {
  const ast = espurify(parse(code, { locations: false })) as ESTree.Program;
  return code;
}
