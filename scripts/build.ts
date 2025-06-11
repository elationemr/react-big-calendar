import * as esbuild from "esbuild";
import path from "path";


export async function build() {
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "..", "src/index.js")],
    bundle: true,
    platform: "browser",
    outfile: path.resolve(__dirname, "..", "lib", "index.es.js"),
    minify: false,
    external: [
     "react",
     "react-dom",
    ],
    logLevel: "silent",
    format: "cjs",
    jsx: "automatic",
    loader: {
      ".js": "jsx",
    },
  });
}

build();
