const fs = require("fs");
const path = require("path");
const util = require("util");
const atomdoc = require("../atomdoc");
const parseArgs = require("./parseArgs.js");

module.exports =
async function main(args) {
  const opts = parseArgs(args);

  if (opts.verbose) {
    console.log("Provided Args...");
    console.log(opts);
  }

  // This should be an array of strings, that may or may not contain
  // documentation we care about
  const eligibleComments = [];

  await enumerateFiles(opts.directory, [], (file, pathArray, filename, immediateReturn) => {

    try {
      const fileContent = fs.readFileSync(file, { encoding: "utf8" });

      const rl = fileContent.split("\n");

      const fileObject = {
        file: file,
        name: filename,
        comments: [],
        parsedDocs: []
      };

      let activateCollection = false;
      let tmpContents = "";
      for (const line of rl) {
        if (line.includes("/*") && !line.includes("/**")) {
          // Opening the comment section
          // TODO: Support for content on the same line
          activateCollection = true;
          continue;
        }
        if (line.includes("*/") && activateCollection) {
          // Closing the comment section
          fileObject.comments.push(tmpContents);
          tmpContents = "";
          activateCollection = false;
        }
        if (activateCollection) {
          // Add the current line contents, and add back the newline we stripped
          tmpContents += line + "\n";
        }
      }

      eligibleComments.push(fileObject);

    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  });

  if (eligibleComments.length === 0) {
    console.error("Found no comments to collect!");
    process.exit(1);
  }

  // Otherwise we should have some comments to do stuff with
  if (opts.verbose) {
    console.log("Raw array of comments extracted from source...");
    console.log(eligibleComments);
  }
  // Which we can now provide to `atomdoc` and get some JSON documentation out of it

  for (let i = 0; i < eligibleComments.length; i++) {
    for (let y = 0; y < eligibleComments[i].comments.length; y++) {
      let doc = parseDoc(eligibleComments[i].comments[y]);
      if (doc) {
        eligibleComments[i].parsedDocs.push(doc);
      }
    }
  }

  if (opts.verbose) {
    console.log("Raw atomdocs data generated...");
    console.log(util.inspect(eligibleComments, { depth: null }));
  }

  // Now with our json documentation data, we can output this as whatever we want.
  if (opts.output === "markdown") {

  } else if (opts.output === "html") {

  } else if (opts.output === "json") {

  } else if (opts.output === "cmd") {
    console.log(util.inspect(eligibleComments, { depth: null }));
  }

  console.log("Successfully parsed data!");
}

function parseDoc(content) {
  // This serves as a small wrapper around atomdoc, so that we can easily expand
  // it's support of different items, without having to delve into the regex
  // and more complicated functionality of the module itself

  // So first lets look for our supported items, and extract them from the text
  // if found.

  let name, type;
  let contentLines = content.split("\n");
  let idx = contentLines.length;

  while (idx--) {
    if (contentLines[idx].trim().startsWith("# Name: ")) {
      name = contentLines[idx].trim().replace("# Name: ", "");
      contentLines.splice(idx, 1);
    } else if (contentLines[idx].trim().startsWith("# Type: ")) {
      type = contentLines[idx].trim().replace("# Type: ", "");
      contentLines.splice(idx, 1);
    }
  }

  let contentAfter = contentLines.join("\n");

  let doc = atomdoc.parse(contentAfter);
  if (doc) {
    if (typeof name === "string") {
      doc.name = name;
    }
    if (typeof type === "string") {
      doc.type = type;
    }

    return doc;
  } else {
    return null;
  }
}

async function enumerateFiles(dir, pathArray, fileCallback) {
  // dir: The starting directory
  // pathArray: The array of path entries
  // fileCallback: Function to invoke when a file is found
  // When a callback is invoked the following is passed:
  // - file: Which is the file and it's preceeding path. A relative path to a specific file.
  // - pathArray: The path as an array leading up to that file, from the initial dir passed.
  // - filename: The specific file's name.
  // - immediateReturn: An overloaded paramter passed only when the immediate dir
  //   passed was a direct file path.

  if (fs.lstatSync(dir).isFile()) {
    // The initial dir is a file, not a dir
    await fileCallback(dir, pathArray, path.basename(dir), true);
    return;
  }

  let files = fs.readdirSync(dir);

  for (const file of files) {
    let target = path.join(dir, file);

    if (fs.lstatSync(target).isDirectory()) {
      await enumerateFiles(`./${target}`, [ ...pathArray, file], fileCallback);
    } else {
      await fileCallback(target, pathArray, file);
    }
  }
}
