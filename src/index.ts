import { parse } from "acorn";
import estraverse from "estraverse";
import type ESTree from "estree";

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
const DOC_BUILDER_FUNCTIONS = [
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
];

/* doc builder value name */
const BREAK_PARENT = "breakParent";
const LINE = "line";
const SOFT_LINE = "softline";
const HARD_LINE = "hardline";
const LITERAL_LINE = "literalline";
const LINE_SUFFIX_BOUNDARY = "lineSuffixBoundary";
const TRIM = "trim";
const CURSOR = "cursor";
const DOC_BUILDER_VARS = [
  BREAK_PARENT,
  LINE,
  SOFT_LINE,
  HARD_LINE,
  LITERAL_LINE,
  LINE_SUFFIX_BOUNDARY,
  TRIM,
  CURSOR,
];

const VALID_NODE_TYPES = new Set([
  "Identifier",
  "CallExpression",
  "Literal",
  "ArrayExpression",
]);
function isValidDocNode(
  node: ESTree.Node
): node is ESTree.Identifier | ESTree.CallExpression | ESTree.Literal {
  if (!VALID_NODE_TYPES.has(node.type)) {
    return false;
  }
  if (
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    DOC_BUILDER_FUNCTIONS.includes(node.callee.name)
  ) {
    return true;
  } else if (
    node.type === "Identifier" &&
    (DOC_BUILDER_VARS.includes(node.name) ||
      DOC_BUILDER_FUNCTIONS.includes(node.name))
  ) {
    return true;
  } else if (node.type === "Literal") {
    return true;
  } else if (node.type === "ArrayExpression") {
    return node.elements.every(isValidDocNode);
  }
  return false;
}

export function evaluate(code: string): string {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- To use better AST type definitions */
  const ast = (parse(code, { locations: false }) as any) as ESTree.Program;
  if (ast.body.length > 1) {
    throw new SyntaxError("There are tow root nodes.");
  }

  const rootNode = ast.body[0];
  if (rootNode.type !== "ExpressionStatement") {
    throw new SyntaxError("The root node should be ExpressionStatement");
  }

  const mainExpression = rootNode.expression;

  estraverse.traverse(mainExpression, {
    enter(node) {
      if (!isValidDocNode(node)) {
        throw new SyntaxError(`The node is invalid: ${JSON.stringify(node)}`);
      }
    },
  });

  return code;
}
