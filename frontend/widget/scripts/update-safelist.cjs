const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

const fs = require("fs");
const ts = require("typescript");
const vm = require("vm");

// Helper to load a named export from a TS module by transpiling in-process
function loadTsExport(tsPath, exportName) {
  const code = fs.readFileSync(tsPath, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const sandbox = {
    exports: {},
    module: { exports: {} },
    require,
    __dirname: path.dirname(tsPath),
    __filename: tsPath,
    console,
  };
  vm.runInNewContext(transpiled, sandbox, { filename: tsPath });
  return sandbox.module.exports[exportName] || sandbox.exports[exportName];
}

// Use CVA configs + utility to generate safelist (loaded via transpiled TS)
const buttonVariantOptions = loadTsExport(path.join(__dirname, "..", "src/puck/components/button.config.ts"), "buttonVariantOptions");
const cardVariantOptions = loadTsExport(path.join(__dirname, "..", "src/puck/components/card.config.ts"), "cardVariantOptions");
const cvaVariantsToSafelist = loadTsExport(path.join(__dirname, "..", "src/puck/utils/cva-to-safelist.ts"), "cvaVariantsToSafelist");

const projectRoot = path.resolve(__dirname, "..");
const safelistPath = path.join(projectRoot, "tailwind.safelist.txt");

const existing = readFileSync(safelistPath, "utf-8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const generated = cvaVariantsToSafelist(buttonVariantOptions.variant, buttonVariantOptions.size, cardVariantOptions.variant);
const merged = Array.from(new Set([...existing, ...generated])).sort();

writeFileSync(safelistPath, merged.join("\n") + "\n");
console.log(`Updated safelist with ${generated.length} classes (total ${merged.length}).`);
