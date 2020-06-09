import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default {
  input: "./src/index.ts",
  output: {
    file: "./dist/index.js",
    format: "esm",
  },
  plugins: [
    commonjs(),
    resolve({ preferBuiltins: false }),
    builtins(),
    globals(),
    replace({
      "process.env.PRETTIER_TARGET": JSON.stringify("universal"),
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.PRETTIER_DEBUG": "global.PRETTIER_DEBUG",
    }),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationMap: true,
        },
        exclude: ["**/__tests__"],
        include: ["./src/**.ts"],
      },
    }),
    terser(),
  ],
};
