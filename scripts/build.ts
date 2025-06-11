import * as esbuild from "esbuild";
import path from "path";
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));

const deps = Object.keys(pkg.dependencies || {});
const peerDeps = Object.keys(pkg.peerDependencies || {});

const allExternals = Array.from(new Set([...deps, ...peerDeps]));

export async function build() {
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "..", "src/index.js")],
    bundle: true,
    platform: "browser",
    outfile: path.resolve(__dirname, "..", "lib", "index.esm.js"),
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
