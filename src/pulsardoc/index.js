const fs = require("fs");
const path = require("path");
const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");
const martha = require("./martha.js");

module.exports =
class PulsarDocTS {
  constructor(paths=[], opts={}) {
    this.paths = paths;
    this.userOpts = opts;
    this.defaultOpts = {};
    this.opts = {
      ...this.defaultOpts,
      ...this.userOpts
    };
  }

  // Single function to execute all steps
  main() {
    let parsed = this.parse();

  }

  // Parse documentation data from Source Files
  parse() {
    let parsed = { files: {} };

    const files = [];

    for (let i = 0; i < this.paths.length; i++) {
      let absolutePath = path.isAbsolute(this.paths[i])
        ? this.paths[i]
        : path.join(process.cwd(), this.paths[i]);

      if (fs.statSync(absolutePath).isDirectory()) {
        for (const entry of fs.readdirSync(absolutePath)) {
          files.push(path.join(this.paths[i], entry));
        }
      } else {
        files.push(absolutePath);
      }
    }

    for (let i = 0; i < files.length; i++) {
      parsed.files[files[i]] = this.parseFile(files[i]);
    }

    return parsed;
  }

  // Parse documentation data from JavaScript files
  parseFile(filePath) {
    let ext = path.parse(filePath).ext;
    let file = fs.readFileSync(filePath, { encoding: "utf8" });

    const parser = new Parser();
    let unknownLang = false;

    switch(ext) {
      case ".js":
        parser.setLanguage(JavaScript);
        break;
      default:
        console.error(`Unknown extension: '${ext}'!`);
        unknownLang = true;
        break;
    }

    if (unknownLang) {
      return;
    }

    const tree = parser.parse(file);

    const code = martha(tree);

    return code;
  }
}
