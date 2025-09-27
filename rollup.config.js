import { terser } from "rollup-plugin-terser";

export default {
  input: "src/leadbot.js",
  output: {
    file: "dist/leadbot.js",
    format: "iife",
    name: "Leadbot",
  },
  plugins: [terser()],
};