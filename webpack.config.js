module.exports = {
  entry: {
      main: './src/index.ts'
  },
  output: {
    filename: "index.js",
    path: __dirname + "/dist",
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
};
