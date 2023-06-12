const fs = require("node:fs/promises");
const path = require("node:path");
const posix = require("node:path/posix");

const rxHasExports = /^export\s/m;
const rxIsTs = /^(?!index).*\.tsx?$/;
const rxIsDTs = /\.d\.tsx?$/;

async function listFiles(dir) {
  const files = [], dirs = [];
  for (const p of await fs.readdir(dir)) {
    const file = path.join(dir, p);
    const stats = await fs.stat(file);
    if (stats.isFile() && rxIsTs.test(p) && !rxIsDTs.test(p))
      files.push(file);
    else if (stats.isDirectory())
      dirs.push(file);
  }
  return { files, dirs };
}

async function generateIndex(files, dirs, dir) {
  const entries = [];
  for (const dir of dirs) {
    const { files, dirs } = await listFiles(dir);
    if (await generateIndex(files, dirs, dir)) entries.push(dir);
  }

  for (const file of files) {
    const content = await fs.readFile(file, "utf-8");
    if (rxHasExports.test(content)) entries.push(file);
  }

  if (!entries.length) return false;
  const contents = entries.map(path => {
    return `export * from "${posix.relative(".", path).replace(/\.tsx?$/, "").replace(/\\/g, "/")}";\n`;
  }).join("");
  await fs.writeFile(path.resolve(".", dir, "index.ts"), contents, "utf-8");
  return true;
}

async function main() {
  await Promise.all(process.argv.slice(2).map(async dir => {
    const { files, dirs } = await listFiles(dir);
    await generateIndex(files, dirs, dir);
  }));
}

main().catch(console.error).then();
