declare module "prettier/standalone" {
  import * as prettier from "prettier";
  export const doc: {
    builders: typeof prettier.doc.builders;
    printer: {
      printDocToString: (doc: any, options?: any) => { formatted: string };
    }
  };
}
