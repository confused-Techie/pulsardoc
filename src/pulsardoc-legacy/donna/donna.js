const fs = require('fs');
const util = require('util');
const path = require('path');
const walkdir = require('walkdir');
const Async = require('async');
const _ = require('underscore');
const CoffeeScript = require('coffee-script');
const Parser = require('./parser');
const Metadata = require('./metadata');
const exec = require('child_process').exec;
const SRC_DIRS = ['src', 'lib', 'app'];
const BLACKLIST_FILES = ['Gruntfile.coffee'];

function main(opts = {}) {
  let inputs = opts.inputs;
  let output = opts.output;

  if (output) {
    return writeMetadata(generateMetadata(inputs), output);
  } else {
    return generateMetadata(inputs);
  }
}

function generateMetadata(inputs) {
  let metadataSlugs = [];
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    if (!(fs.existsSync || path.existsSync)(input)) {
      continue;
    }
    let parser = new Parser();
    let packageJsonPath = path.join(input, 'package.json');
    let stats = fs.lstatSync(input);
    let absoluteInput = path.resolve(process.cwd(), input);
    if (stats.isDirectory()) {
      let dir = walkdir.sync(input);
      for (let j = 0; j < dir.length; j++) {
        let filename = dir[j];
        if (isAcceptableFile(filename) && isInAcceptableDir(absoluteInput, filename)) {
          try {
            parser.parseFile(filename, absoluteInput);
          } catch (err) {
            logError(filename, err);
          }
        }
      }
    } else {
      if (isAcceptableFile(input)) {
        try {
          parser.parseFile(input, path.dirname(input));
        } catch (err) {
          logError(filename, err);
        }
      }
    }
    metadataSlugs.push(generateMetadataSlug(packageJsonPath, parser));
  }
  return metadataSlugs;
}

function logError(filename, error) {
  if (error.location != null) {
    return console.warn("Cannot parse file " + filename + "@" + error.location.first_line + ": " + error.message);
  } else {
    return console.warn("Cannot parse file " + filename + ": " + error.message);
  }
}

function isAcceptableFile(filePath) {
  var file, i, len;
  try {
    if (fs.statSync(filePath).isDirectory()) {
      return false;
    }
  } catch (undefined) {}
  for (i = 0, len = BLACKLIST_FILES.length; i < len; i++) {
    file = BLACKLIST_FILES[i];
    if (new RegExp(file + '$').test(filePath)) {
      return false;
    }
  }
  return filePath.match(/\._?coffee$/);
}

function isInAcceptableDir(inputPath, filePath) {
  var acceptableDirs, dir, i, len;
  if (path.join(inputPath, path.basename(filePath)) === filePath) {
    return true;
  }
  acceptableDirs = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = SRC_DIRS.length; i < len; i++) {
      dir = SRC_DIRS[i];
      results.push(path.join(inputPath, dir));
    }
    return results;
  })();
  for (i = 0, len = acceptableDirs.length; i < len; i++) {
    dir = acceptableDirs[i];
    if (filePath.indexOf(dir) === 0) {
      return true;
    }
  }
  return false;
}

function writeMetadata(metadataSlugs, output) {
  return fs.writeFileSync(path.join(output, 'metadata.json'), JSON.stringify(metadataSlugs, null, "    "));
}

function generateMetadataSlug(packageJsonPath, parser) {
  var content, filename, metadata, packageJson, ref, ref1, ref2, ref3, slug;
  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  }
  metadata = new Metadata((ref = packageJson != null ? packageJson.dependencies : void 0) != null ? ref : {}, parser);
  slug = {
    main: findMainFile(packageJsonPath, packageJson != null ? packageJson.main : void 0),
    repository: (ref1 = packageJson != null ? (ref2 = packageJson.repository) != null ? ref2.url : void 0 : void 0) != null ? ref1 : packageJson != null ? packageJson.repository : void 0,
    version: packageJson != null ? packageJson.version : void 0,
    files: {}
  };
  ref3 = parser.iteratedFiles;
  for (filename in ref3) {
    content = ref3[filename];
    metadata.generate(CoffeeScript.nodes(content));
    populateSlug(slug, filename, metadata);
  }
  return slug;
}

function populateSlug(slug, filename, arg) {
  var exports, key, objects, prop, startColNumber, startLineNumber, unindexedObjects, value;
  unindexedObjects = arg.defs, exports = arg.exports;
  objects = {};
  for (key in unindexedObjects) {
    value = unindexedObjects[key];
    startLineNumber = value.range[0][0];
    startColNumber = value.range[0][1];
    if (objects[startLineNumber] == null) {
      objects[startLineNumber] = {};
    }
    objects[startLineNumber][startColNumber] = value;
    if (value.type === 'class') {
      value.classProperties = (function() {
        var i, len, ref, results;
        ref = _.clone(value.classProperties);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          prop = ref[i];
          results.push([prop.range[0][0], prop.range[0][1]]);
        }
        return results;
      })();
      value.prototypeProperties = (function() {
        var i, len, ref, results;
        ref = _.clone(value.prototypeProperties);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          prop = ref[i];
          results.push([prop.range[0][0], prop.range[0][1]]);
        }
        return results;
      })();
    }
  }
  if (exports._default != null) {
    if (exports._default.range != null) {
      exports = exports._default.range[0][0];
    }
  } else {
    for (key in exports) {
      value = exports[key];
      exports[key] = value.startLineNumber;
    }
  }
  slug["files"][filename] = {
    objects: objects,
    exports: exports
  };
  return slug;
}

function findMainFile(packageJsonPath, main_file) {
  var composite_main, dir, file, filename, filepath, i, len;
  if (main_file == null) {
    return;
  }
  if (main_file.match(/\.js$/)) {
    main_file = main_file.replace(/\.js$/, ".coffee");
  } else {
    main_file += ".coffee";
  }
  filename = path.basename(main_file);
  filepath = path.dirname(packageJsonPath);
  for (i = 0, len = SRC_DIRS.length; i < len; i++) {
    dir = SRC_DIRS[i];
    composite_main = path.normalize(path.join(filepath, dir, filename));
    if (fs.existsSync(composite_main)) {
      file = path.relative(packageJsonPath, composite_main);
      if (file.match(/^\.\./)) {
        file = file.substring(1, file.length);
      }
      return file;
    }
  }
}

module.exports = {
  Parser: Parser,
  Metadata: Metadata,
  main: main,
  generateMetadata: generateMetadata,
  generateMetadataSlug: generateMetadataSlug,
  populateSlug: populateSlug
};
