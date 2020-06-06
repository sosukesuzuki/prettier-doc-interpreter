import { parse } from "acorn";
import type ESTree from "estree";
import { doc, __debug } from "prettier";
import type { Doc } from "prettier";

const { builders } = doc;

class InvalidDocNodeError extends Error {
  loc?: ESTree.SourceLocation | null;
  constructor(message: string, loc?: null | ESTree.SourceLocation) {
    if (loc) {
      super(`${message} (${loc.start.line}:${loc.start.column})`);
      this.loc = loc;
    } else {
      super(message);
    }
  }
}

/* doc builder function names */
const GROUP = "group";
const CONCAT = "concat";
const CONDITIONAL_GROUP = "conditionalGroup";
const FILL = "fill";
const IF_BREAK = "ifBreak";
const JOIN = "join";
const LINE_SUFFIX = "lineSuffix";
const INDENT = "indent";
const ALIGN = "align";
const MARK_AS_ROOT = "markAsRoot";
const DEDENT_TO_ROOT = "dedentToRoot";
const DOC_BUILDER_FUNCTIONS = new Set([
  GROUP,
  CONCAT,
  CONDITIONAL_GROUP,
  FILL,
  IF_BREAK,
  JOIN,
  LINE_SUFFIX,
  INDENT,
  ALIGN,
  MARK_AS_ROOT,
  DEDENT_TO_ROOT,
]);

/* doc builder value name */
const BREAK_PARENT = "breakParent";
const LINE = "line";
const SOFT_LINE = "softline";
const HARD_LINE = "hardline";
const LITERAL_LINE = "literalline";
const LINE_SUFFIX_BOUNDARY = "lineSuffixBoundary";
const TRIM = "trim";
const CURSOR = "cursor";
const DOC_BUILDER_VARS = new Set([
  BREAK_PARENT,
  LINE,
  SOFT_LINE,
  HARD_LINE,
  LITERAL_LINE,
  LINE_SUFFIX_BOUNDARY,
  TRIM,
  CURSOR,
]);
const DOC_BUILDER_VARS_MAP = new Map<string, Doc>([
  [BREAK_PARENT, builders.breakParent],
  [LINE, builders.line],
  [SOFT_LINE, builders.softline],
  [HARD_LINE, builders.hardline],
  [LITERAL_LINE, builders.literalline],
  [LINE_SUFFIX_BOUNDARY, builders.lineSuffixBoundary],
  // [TRIM, builders.trim],
  // [CURSOR, builders.cursor]
]);

const VALID_NODE_TYPES = new Set([
  "Identifier",
  "CallExpression",
  "Literal",
  "ArrayExpression",
]);
function validateNodeDoc(
  node: ESTree.Node
): asserts node is
  | ESTree.Identifier
  | ESTree.SimpleCallExpression
  | ESTree.Literal
  | ESTree.ArrayExpression {
  if (!VALID_NODE_TYPES.has(node.type)) {
    throw new InvalidDocNodeError(
      `${node.type} is invalid node type`,
      node.loc
    );
  }
  switch (node.type) {
    case "CallExpression": {
      if (node.callee.type !== "Identifier") {
        throw new InvalidDocNodeError(
          `A CallExpression callee should be Identifier, received: ${node.callee.type}`,
          node.loc
        );
      }
      validateNodeDoc(node.callee);
      break;
    }
    case "Identifier": {
      if (
        !DOC_BUILDER_FUNCTIONS.has(node.name) &&
        !DOC_BUILDER_VARS.has(node.name)
      ) {
        throw new InvalidDocNodeError(
          `${node.name} is unknown doc builder name`,
          node.loc
        );
      }
      break;
    }
    case "Literal": {
      if (!node.value) {
        throw new InvalidDocNodeError(
          "An Literal value should exist",
          node.loc
        );
      }
      const typeofNodeValue = typeof node.value;
      if (typeofNodeValue !== "string" && typeofNodeValue !== "number") {
        throw new InvalidDocNodeError(
          "An Literal should be string or number",
          node.loc
        );
      }
      break;
    }
    case "ArrayExpression":
      for (const element of node.elements) {
        validateNodeDoc(element);
      }
      break;
  }
}

function astToDoc(node: ESTree.Node): any {
  validateNodeDoc(node);
  switch (node.type) {
    case "CallExpression": {
      const calleeName = (node.callee as ESTree.Identifier).name;
      switch (calleeName) {
        case GROUP:
          return builders.group(astToDoc(node.arguments[0]));
        case CONCAT:
          return builders.concat(astToDoc(node.arguments[0]));
        default:
          throw new InvalidDocNodeError(
            `Unknown doc function type: ${calleeName}`,
            node.loc
          );
      }
    }
    case "Identifier": {
      const doc = DOC_BUILDER_VARS_MAP.get(node.name);
      if (doc) {
        return doc;
      }
      throw new InvalidDocNodeError(
        `Unknown doc var type: ${node.name}`,
        node.loc
      );
    }
    case "ArrayExpression": {
      return node.elements.map(astToDoc);
    }
    case "Literal": {
      return node.value as string | number;
    }
  }
}

type Options = {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
};
export function evaluate(
  code: string,
  options: Options = { printWidth: 80, tabWidth: 2, useTabs: false }
): string {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- To use better AST type definitions */
  const ast = (parse(code, { locations: true }) as any) as ESTree.Program;
  if (ast.body.length > 1) {
    throw new InvalidDocNodeError("There are two root nodes", ast.body[1].loc);
  }

  const rootNode = ast.body[0];
  if (rootNode.type !== "ExpressionStatement") {
    throw new InvalidDocNodeError(
      "The root node should be ExpressionStatement",
      rootNode.loc
    );
  }

  const mainExpression = rootNode.expression;
  const doc = astToDoc(mainExpression);
  const result = __debug.printDocToString(doc, { ...options, parser: "babel" });

  return result.formatted;
}
