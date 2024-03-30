const fs = require("fs");
const path = require("path");

const joanna = require("./joanna.js");
const tello = require("./tello.js");
const donna = require("./donna/donna.js");
const atomdoc = require("./atomdoc/index.js");
const jsdoc = require("./consume-js-doc.js");

module.exports =
class PulsarDoc {
  constructor(paths=[], opts={}) {
    this.paths = paths;
    this.userOpts = opts;
    this.defaultOpts = {
      warn_on_unrecognized_file: false,
      write_temp_files: false,
      repository: false,
      version: false
    };
    this.opts = {
      ...this.defaultOpts,
      ...this.userOpts
    };
  }

  // Single function to execute all steps
  main() {
    let parsed = this.parse();

    let digested = this.digest([parsed]);

    let jsdocified = this.consumeJSDoc(digested);

    if (this.opts.write_temp_files) {
      fs.writeFileSync("parsed.json", JSON.stringify(parsed, null, 2), { encoding: "utf8" });
      fs.writeFileSync("digested.json", JSON.stringify(digested, null, 2), { encoding: "utf8" });
      fs.writeFileSync("jsdocified.json", JSON.stringify(jsdocified, null, 2), { encoding: "utf8" });
    }

    return jsdocified;
  }

  // Parse documentation data from Source Files
  parse() {
    let parsed = { files: {} };

    const jsFiles = [];
    const coffeeFiles = [];

    for (let i = 0; i < this.paths.length; i++) {
      let ext = path.parse(this.paths[i]).ext;
      let absolutePath = path.isAbsolute(this.paths[i])
        ? this.paths[i]
        : path.join(process.cwd(), this.paths[i]);

      if (fs.statSync(absolutePath).isDirectory()) {
        for (const entry of fs.readdirSync(absolutePath)) {
          let entryExt = path.parse(entry).ext;
          if (entryExt === ".js") {
            jsFiles.push(path.join(this.paths[i], entry));
          } else if (entryExt === ".coffee") {
            coffeeFiles.push(path.join(this.paths[i], entry));
          } else if (this.opts.warn_on_unrecognized_file) {
            console.error(`Unrecognized Filetype: ${entry}`);
          }
        }
      } else {
        if (ext === ".js") {
          jsFiles.push(absolutePath);
        } else if (ext === ".coffee") {
          coffeeFiles.push(absolutePath);
        } else if (this.opts.warn_on_unrecognized_file) {
          console.error(`Unrecognized Filetype: ${absolutePath}`);
        }
      }
    }

    // now to read the lists and parse

    for (let i = 0; i < jsFiles.length; i++) {
      parsed.files[jsFiles[i]] = this.parseJava(jsFiles[i]);
    }

    for (let i = 0; i < coffeeFiles.length; i++) {
      parsed.files[coffeeFiles[i]] = this.parseCoffee(coffeeFiles[i]);
    }

    // add meta if we can find it
    if (fs.existsSync(path.join(this.paths[0], "../", "package.json"))) {
      let packJson = JSON.parse(fs.readFileSync(path.join(this.paths[0], "../", "package.json")));
      parsed.repository = packJson.repository.url;
      parsed.version = packJson.version;
    } else {
      // add meta if provided
      if (this.opts.repository) {
        parsed.repository = this.opts.repository;
      }
      if (this.opts.version) {
        parsed.version = this.opts.version;
      }
    }

    return parsed;
  }

  // Parse documentation data from JavaScript files
  parseJava(filePath) {
    const file = fs.readFileSync(filePath, { encoding: "utf8" });
    const code = joanna(file);
    return code;
  }

  // Parse documentation data from CoffeeScript files
  parseCoffee(filePath) {
    const code = donna.main({ inputs: [filePath] });
    let baseName = path.basename(filePath);
    return code[0].files[baseName];
  }

  // Digest documentation data into final output
  digest(content) {
    const digested = tello.digest(content, { pulsardoc: this.consumeMark });
    return digested;
  }

  // Consume Markdown content to turn into documentation
  consumeMark(content, opts = {}) {
    try {
      const doc = atomdoc.parse(content, opts);
      return doc;
    } catch (err) {
      console.error(`Error parsing markdown content:`, err);
      return "";
    }
  }

  consumeJSDoc(content) {
    const doc = jsdoc(content);
    return doc;
  }
}
