const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  entry: "./src/renderer/main.ts", // Vue app entry point
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "renderer.js",
  },
  resolve: {
    extensions: [".ts", ".js", ".vue"], // Add .vue for resolving
    alias: {
      vue$: "vue/dist/vue.esm-bundler.js", // Use Vue's ESM build
      "@": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/], // Allow TypeScript in Vue files
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader", // Process .vue files
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], // Process CSS
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};