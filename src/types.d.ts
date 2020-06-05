import * as prettier from "prettier";
declare module "prettier" {
  const __debug: {
    printDocToString: (doc: any, options?: any) => { formatted: string };
  };
}
