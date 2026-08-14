// Normalize import-path casing before building.
//
// Netlify (Linux) resolves imports case-sensitively, but the Windows editor
// sometimes writes imports as ../Services/, ../../Utils/, ../Components/ or
// ../Context/ while the real folders are lowercase. This script rewrites the
// wrong casing in place and reports what it fixed, so deploys can never break
// on this class of error again.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const SRC = resolve("src");
const WRONG_TO_RIGHT = [
  ["/Services/", "/services/"],
  ["/Utils/", "/utils/"],
  ["/Components/", "/components/"],
  ["/Context/", "/context/"],
];

function* sourceFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      yield* sourceFiles(path);
    } else if (name.endsWith(".js") || name.endsWith(".jsx")) {
      yield path;
    }
  }
}

let fixedFiles = 0;
for (const file of sourceFiles(SRC)) {
  const content = readFileSync(file, "utf8");
  let next = content;
  for (const [wrong, right] of WRONG_TO_RIGHT) {
    next = next.split(wrong).join(right);
  }
  if (next !== content) {
    writeFileSync(file, next);
    fixedFiles++;
    console.log(`[fix-import-casing] fixed: ${file}`);
  }
}

if (fixedFiles > 0) {
  console.log(`[fix-import-casing] normalized ${fixedFiles} file(s) — commit these changes.`);
}
