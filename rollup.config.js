import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
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
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationMap: true,
        },
        exclude: ["**/__tests__"],
        include: ["./src/**.ts"]
      },
    }),
    terser(),
  ],
};
