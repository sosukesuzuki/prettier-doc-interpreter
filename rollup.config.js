import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: {
    file: "./dist/index.js",
    format: "esm",
  },
  plugins: [
    commonjs(),
    resolve(),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationMap: true,
        },
        exclude: ['**/__tests__'],
      },
    }),
    terser(),
  ],
};
