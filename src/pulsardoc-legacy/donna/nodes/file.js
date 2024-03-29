// Generated by CoffeeScript 1.10.0
(function() {
  var Class, Doc, File, Method, Path, Variable,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Path = require('path');

  Class = require('./class');

  Method = require('./method');

  Variable = require('./variable');

  Doc = require('./doc');

  module.exports = File = (function(superClass) {
    extend(File, superClass);

    function File(node, fileName, lineMapping, options) {
      var doc, error, error1, exp, i, j, len, len1, previousExp, previousProp, prop, ref, ref1, ref2, ref3;
      this.node = node;
      this.fileName = fileName;
      this.lineMapping = lineMapping;
      this.options = options;
      try {
        this.methods = [];
        this.variables = [];
        previousExp = null;
        ref = this.node.expressions;
        for (i = 0, len = ref.length; i < len; i++) {
          exp = ref[i];
          switch (exp.constructor.name) {
            case 'Assign':
              if ((previousExp != null ? previousExp.constructor.name : void 0) === 'Comment') {
                doc = previousExp;
              }
              switch ((ref1 = exp.value) != null ? ref1.constructor.name : void 0) {
                case 'Code':
                  this.methods.push(new Method(this, exp, this.lineMapping, this.options, doc));
                  break;
                case 'Value':
                  if (exp.value.base.value) {
                    this.variables.push(new Variable(this, exp, this.lineMapping, this.options, true, doc));
                  }
              }
              doc = null;
              break;
            case 'Value':
              previousProp = null;
              ref2 = exp.base.properties;
              for (j = 0, len1 = ref2.length; j < len1; j++) {
                prop = ref2[j];
                if ((previousProp != null ? previousProp.constructor.name : void 0) === 'Comment') {
                  doc = previousProp;
                }
                if (((ref3 = prop.value) != null ? ref3.constructor.name : void 0) === 'Code') {
                  this.methods.push(new Method(this, prop, this.lineMapping, this.options, doc));
                }
                doc = null;
                previousProp = prop;
              }
          }
          previousExp = exp;
        }
      } catch (error1) {
        error = error1;
        if (this.options.verbose) {
          console.warn('File class error:', this.node, error);
        }
      }
    }

    File.prototype.getFullName = function() {
      var fullName, i, input, len, ref;
      fullName = this.fileName;
      ref = this.options.inputs;
      for (i = 0, len = ref.length; i < len; i++) {
        input = ref[i];
        input = input.replace(/^\.[\/]/, '');
        if (!RegExp(Path.sep + "$").test(input)) {
          input = input + Path.sep;
        }
        input = input.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        fullName = fullName.replace(new RegExp(input), '');
      }
      return fullName.replace(Path.sep, '/');
    };

    File.prototype.getFileName = function() {
      return Path.basename(this.getFullName());
    };

    File.prototype.getPath = function() {
      var path;
      path = Path.dirname(this.getFullName());
      if (path === '.') {
        path = '';
      }
      return path;
    };

    return File;

  })(Class);

}).call(this);
