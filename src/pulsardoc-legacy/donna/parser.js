const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const isBlank = require("../helpers/underscore.string/isBlank.js");
const CoffeeScript = require('coffee-script');
const File = require('./nodes/file');
const Class = require('./nodes/class');
const Mixin = require('./nodes/mixin');
const VirtualMethod = require('./nodes/virtual_method');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports =
class Parser {
  constructor(options = {}) {
    this.options = options;
    this.files = [];
    this.classes = [];
    this.mixins = [];
    this.iteratedFiles = {};
    this.fileCount = 0;
    this.globalStatus = "Private";
  }

  parseFile(filePath, relativeTo) {
    let content = fs.readFileSync(filePath, 'utf8');
    let relativePath = path.normalize(filePath.replace(relativeTo, "." + path.sep));
    this.parseContent(content, relativePath);
    this.iteratedFiles[relativePath] = content;
    return this.fileCount += 1;
  }

  parseContent(content, file) {
    var convertedContent, entities, error, error1, fileClass, lineMapping, ref, root, sourceMap;
    this.content = content;

    if (file == null) {
      file = '';
    }

    this.previousNodes = [];
    this.globalStatus = "Private";

    entities = {
      clazz: function(node) {
        return node.constructor.name === "Class" && (node.variable ?? node.base);
      },
      mixin: function(node) {
        return node.constructor.name === "Assign" && (node.value ?? node.base.properties);
      }
    };
    ref = this.convertComments(this.content), convertedContent = ref[0], lineMapping = ref[1];
    sourceMap = CoffeeScript.compile(convertedContent, {
      sourceMap: true
    }).v3SourceMap;
    this.smc = new SourceMapConsumer(sourceMap);
    try {
      root = CoffeeScript.nodes(convertedContent);
    } catch (error1) {
      error = error1;
      if (this.options.debug) {
        console.log('Parsed CoffeeScript source:\n%s', convertedContent);
      }
      throw error;
    }
    fileClass = new File(root, file, lineMapping, this.options);
    this.files.push(fileClass);
    this.linkAncestors(root);
    root.traverseChildren(true, (function(_this) {
      return function(child) {
        var clazz, condition, doc, entity, i, len, mixin, name, node, p, previous, ref1, ref2, type;
        entity = false;
        for (type in entities) {
          condition = entities[type];
          if (entities.hasOwnProperty(type)) {
            if (condition(child)) {
              entity = type;
            }
          }
        }
        if (entity) {
          previous = _this.previousNodes[_this.previousNodes.length - 1];
          switch (previous != null ? previous.constructor.name : void 0) {
            case 'Comment':
              doc = previous;
              break;
            case 'Literal':
              if (previous.value === 'exports') {
                node = _this.previousNodes[_this.previousNodes.length - 6];
                if ((node != null ? node.constructor.name : void 0) === 'Comment') {
                  doc = node;
                }
              }
          }
          if (entity === 'mixin') {
            name = [child.variable.base.value];
            ref1 = child.variable.properties;
            for (i = 0, len = ref1.length; i < len; i++) {
              p = ref1[i];
              name.push((ref2 = p.name) != null ? ref2.value : void 0);
            }
            if (name.indexOf(void 0) === -1) {
              mixin = new Mixin(child, file, _this.options, doc);
              if ((mixin.doc.mixin != null) && (_this.options["private"] || !mixin.doc["private"])) {
                _this.mixins.push(mixin);
              }
            }
          }
          if (entity === 'clazz') {
            clazz = new Class(child, file, lineMapping, _this.options, doc);
            _this.classes.push(clazz);
          }
        }
        _this.previousNodes.push(child);
        return true;
      };
    })(this));
    return root;
  }

  convertComments(content) {
    var blockComment, c, comment, commentLine, commentText, globalCount, globalStatusBlock, i, inBlockComment, inComment, indentComment, j, l, lastComment, len, len1, line, lineMapping, member, ref, ref1, result;
    result = [];
    comment = [];
    inComment = false;
    inBlockComment = false;
    indentComment = 0;
    globalCount = 0;
    lineMapping = {};
    ref = content.split('\n');
    for (l = i = 0, len = ref.length; i < len; l = ++i) {
      line = ref[l];
      globalStatusBlock = false;
      lineMapping[(l + 1) + globalCount] = l + 1;
      if (globalStatusBlock = /^\s*#{3} (\w+).+?#{3}/.exec(line)) {
        result.push('');
        this.globalStatus = globalStatusBlock[1];
      }
      blockComment = /^\s*#{3,}/.exec(line) && !/^\s*#{3,}.+#{3,}/.exec(line);
      if (blockComment || inBlockComment) {
        if (blockComment) {
          inBlockComment = !inBlockComment;
        }
        result.push(line);
      } else {
        commentLine = /^(\s*#)\s?(\s*.*)/.exec(line);
        if (commentLine) {
          commentText = (ref1 = commentLine[2]) != null ? ref1.replace(/#/g, "\u0091#") : void 0;
          if (!inComment) {
            if (!/^\s*\w+:/.test(commentText)) {
              commentText = this.globalStatus + ": " + commentText;
            }
            inComment = true;
            indentComment = commentLine[1].length - 1;
            commentText = "### " + commentText;
          }
          comment.push(whitespace(indentComment) + commentText);
        } else {
          if (inComment) {
            inComment = false;
            lastComment = _.last(comment);
            if (isBlank(lastComment)) {
              globalCount++;
              comment[comment.length] = lastComment + ' ###';
            } else {
              comment[comment.length - 1] = lastComment + ' ###';
            }
            if (/(class\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*|^\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff.]*\s+\=|[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*\s*:\s*(\(.*\)\s*)?[-=]>|@[A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*\s*=\s*(\(.*\)\s*)?[-=]>|[$A-Za-z_\x7f-\uffff][\.$\w\x7f-\uffff]*\s*=\s*(\(.*\)\s*)?[-=]>|^\s*@[$A-Z_][A-Z_]*)|^\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*:\s*\S+/.exec(line)) {
              for (j = 0, len1 = comment.length; j < len1; j++) {
                c = comment[j];
                result.push(c);
              }
            }
            comment = [];
          }
          member = /(class\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*|^\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff.]*\s+\=|[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*\s*:\s*(\(.*\)\s*)?[-=]>|@[A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*\s*=\s*(\(.*\)\s*)?[-=]>|[$A-Za-z_\x7f-\uffff][\.$\w\x7f-\uffff]*\s*=\s*(\(.*\)\s*)?[-=]>|^\s*@[$A-Z_][A-Z_]*)|^\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*:\s*\S+/.exec(line);
          if (member && isBlank(_.last(result))) {
            indentComment = /^(\s*)/.exec(line);
            if (indentComment) {
              indentComment = indentComment[1];
            } else {
              indentComment = "";
            }
            globalCount++;
          }
          result.push(line);
        }
      }
    }
    return [result.join('\n'), lineMapping];
  }

  linkAncestors(node) {
    return node.eachChild((function(_this) {
      return function(child) {
        child.ancestor = node;
        return _this.linkAncestors(child);
      };
    })(this));
  }

}

function whitespace(n) {
  var a;
  a = [];
  while (a.length < n) {
    a.push(' ');
  }
  return a.join('');
}
