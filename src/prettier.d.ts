import * as prettier from "prettier";
declare module "prettier" {
  export const __debug: {
    printDocToString: (doc: any, options?: any) => { formatted: string };
  };
}
