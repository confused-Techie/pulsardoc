const fs = require("fs");
const path = require("path");

module.exports =
async function create(opts, content) {
  // This module will simply save the document as API.md
  // TODO: Make this configurable
  // Maybe some versioning or something?

  let filePath = `${opts.outputDir}${path.sep}api.json`;

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), { encoding: "utf8" });
  console.log(`Successfully wrote: ${filePath}`);
  return;
}
