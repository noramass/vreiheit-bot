/* eslint-disable */
const fs = require("fs");
const config = fs.readFileSync(process.cwd() + "/loaders.json", "utf-8");
const extensions = JSON.parse(config).text ?? [];

for (const extension of extensions)
  require.extensions[`.${extension}`] = (m, fileName) => m._compile(
    `module.exports=${JSON.stringify(fs.readFileSync(fileName, "utf-8"))};`,
    fileName,
  );
