import { parse } from "acorn";
import type ESTree from "estree";
import { doc } from 'prettier/standalone';
import type { Doc } from "prettier";

const { printDocToString } = doc.printer;
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
const DEDENT = "dedent";
// const ALIGN = "align";
const MARK_AS_ROOT = "markAsRoot";
const DEDENT_TO_ROOT = "dedentToRoot";

/* doc builder value name */
const BREAK_PARENT = "breakParent";
const LINE = "line";
const SOFT_LINE = "softline";
const HARD_LINE = "hardline";
const LITERAL_LINE = "literalline";
const LINE_SUFFIX_BOUNDARY = "lineSuffixBoundary";
// const TRIM = "trim";
// const CURSOR = "cursor";
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

function assertArrayDocForBuilder<T extends boolean>(
  doc: Doc | Doc[],
  {
    builderName,
    shouldBeArray,
    loc,
  }: {
    builderName: string;
    shouldBeArray: T;
    loc?: null | ESTree.SourceLocation;
  }
): asserts doc is T extends true ? Doc[] : Doc {
  if (shouldBeArray && !Array.isArray(doc)) {
    throw new InvalidDocNodeError(
      `${builderName} argument should be an array`,
      loc
    );
  } else if (!shouldBeArray && Array.isArray(doc)) {
    throw new InvalidDocNodeError(
      `${builderName} argument shouldn't be an array`,
      loc
    );
  }
}

function astToDoc(node: ESTree.Node): Doc | Doc[] {
  switch (node.type) {
    case "CallExpression": {
      if (node.callee.type !== "Identifier") {
        throw new InvalidDocNodeError(
          `A CallExpression callee should be Identifier, received: ${node.callee.type}`,
          node.callee.loc
        );
      }
      switch (node.callee.name) {
        case GROUP: {
          // TODO: Support option
          const doc = astToDoc(node.arguments[0]);
          assertArrayDocForBuilder(doc, {
            builderName: node.callee.name,
            shouldBeArray: false,
            loc: node.arguments[0].loc,
          });
          return builders.group(doc);
        }
        case CONDITIONAL_GROUP: {
          // TODO: Support option
          const doc = astToDoc(node.arguments[0]);
          assertArrayDocForBuilder(doc, {
            builderName: node.callee.name,
            shouldBeArray: true,
            loc: node.arguments[0].loc,
          });
          return builders.conditionalGroup(doc);
        }
        case FILL:
        case CONCAT: {
          const doc = astToDoc(node.arguments[0]);
          assertArrayDocForBuilder(doc, {
            builderName: node.callee.name,
            shouldBeArray: true,
            loc: node.arguments[0].loc,
          });
          return builders[node.callee.name](doc);
        }
        case INDENT:
        case DEDENT:
        case MARK_AS_ROOT:
        case DEDENT_TO_ROOT:
        case LINE_SUFFIX: {
          const doc = astToDoc(node.arguments[0]);
          assertArrayDocForBuilder(doc, {
            builderName: node.callee.name,
            shouldBeArray: false,
            loc: node.arguments[0].loc,
          });
          return builders[node.callee.name](doc);
        }
        case IF_BREAK: {
          if (node.arguments.length !== 2) {
            throw new InvalidDocNodeError(
              `${node.callee.name} requires two arguments`,
              node.loc
            );
          }
          const docLeft = astToDoc(node.arguments[0]);
          assertArrayDocForBuilder(docLeft, {
            builderName: node.callee.name,
            shouldBeArray: false,
            loc: node.arguments[0].loc,
          });
          const docRight = astToDoc(node.arguments[1]);
          assertArrayDocForBuilder(docRight, {
            builderName: node.callee.name,
            shouldBeArray: false,
            loc: node.arguments[1].loc,
          });
          return builders[node.callee.name](docLeft, docRight);
        }
        case JOIN: {
          if (node.arguments.length !== 2) {
            throw new InvalidDocNodeError(
              `${node.callee.name} requires two arguments`,
              node.loc
            );
          }
          const docLeft = astToDoc(node.arguments[0]);
          assertArrayDocForBuilder(docLeft, {
            builderName: node.callee.name,
            shouldBeArray: false,
            loc: node.arguments[0].loc,
          });
          const docRight = astToDoc(node.arguments[1]);
          assertArrayDocForBuilder(docRight, {
            builderName: node.callee.name,
            shouldBeArray: true,
            loc: node.arguments[1].loc,
          });
          return builders[node.callee.name](docLeft, docRight);
        }
        default:
          throw new InvalidDocNodeError(
            `${node.callee.name} is unknown doc builder function name`,
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
        `${node.name} is unknown doc builder value name`,
        node.loc
      );
    }
    case "ArrayExpression": {
      const docs = node.elements.map((element) => {
        const doc = astToDoc(element);
        if (Array.isArray(doc)) {
          throw new InvalidDocNodeError(
            "A node in an array shouldn't be array",
            element.loc
          );
        }
        return doc;
      });
      return docs;
    }
    case "Literal": {
      if (!node.value) {
        throw new InvalidDocNodeError("A Literal value should exist", node.loc);
      }
      if (typeof node.value !== "string") {
        throw new InvalidDocNodeError("A Literal should be string", node.loc);
      }
      return node.value;
    }
    default: {
      throw new InvalidDocNodeError(
        `${node.type} is invalid node type`,
        node.loc
      );
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
  if (code === "") {
    return "";
  }

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
  const result = printDocToString(doc, { ...options, parser: "babel" });

  return result.formatted;
}
