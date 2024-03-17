// Generated by CoffeeScript 1.10.0
(function() {
  var Node, Parameter, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Node = require('./node');

  _ = require('underscore');

  _.str = require('underscore.string');

  module.exports = Parameter = (function(superClass) {
    extend(Parameter, superClass);

    function Parameter(node, options, optionized) {
      this.node = node;
      this.options = options;
      this.optionized = optionized;
    }

    Parameter.prototype.getSignature = function() {
      var error, error1, value;
      try {
        if (!this.signature) {
          this.signature = this.getName();
          if (this.isSplat()) {
            this.signature += '...';
          }
          value = this.getDefault();
          if (value) {
            this.signature += " = " + (value.replace(/\n\s*/g, ' '));
          }
        }
        return this.signature;
      } catch (error1) {
        error = error1;
        if (this.options.verbose) {
          return console.warn('Get parameter signature error:', this.node, error);
        }
      }
    };

    Parameter.prototype.getName = function(i) {
      var error, error1, ref, ref1;
      if (i == null) {
        i = -1;
      }
      try {
        if (this.optionized && i >= 0) {
          this.name = this.node.name.properties[i].base.value;
        }
        if (!this.name) {
          this.name = this.node.name.value;
          if (!this.name) {
            if (this.node.name.properties) {
              this.name = (ref = this.node.name.properties[0]) != null ? (ref1 = ref.name) != null ? ref1.value : void 0 : void 0;
            }
          }
        }
        return this.name;
      } catch (error1) {
        error = error1;
        if (this.options.verbose) {
          return console.warn('Get parameter name error:', this.node, error);
        }
      }
    };

    Parameter.prototype.getDefault = function(i) {
      var error, error1, ref, ref1, ref2, ref3, ref4, ref5;
      if (i == null) {
        i = -1;
      }
      try {
        if (this.optionized && i >= 0) {
          return _.str.strip((ref = this.node.value) != null ? ref.compile({
            indent: ''
          }).slice(1, -1).split(",")[i] : void 0).split(": ")[1];
        } else {
          return (ref1 = this.node.value) != null ? ref1.compile({
            indent: ''
          }) : void 0;
        }
      } catch (error1) {
        error = error1;
        if (((ref2 = this.node) != null ? (ref3 = ref2.value) != null ? (ref4 = ref3.base) != null ? ref4.value : void 0 : void 0 : void 0) === 'this') {
          return "@" + ((ref5 = this.node.value.properties[0]) != null ? ref5.name.compile({
            indent: ''
          }) : void 0);
        } else {
          if (this.options.verbose) {
            return console.warn('Get parameter default error:', this.node, error);
          }
        }
      }
    };

    Parameter.prototype.getOptionizedDefaults = function() {
      var defaults, j, k, len, ref;
      if (this.node.value == null) {
        return '';
      }
      defaults = [];
      ref = this.node.value.compile({
        indent: ''
      }).split("\n").slice(1, -1);
      for (j = 0, len = ref.length; j < len; j++) {
        k = ref[j];
        defaults.push(_.str.strip(k.split(":")[0]));
      }
      return "{" + defaults.join(",") + "}";
    };

    Parameter.prototype.isSplat = function() {
      var error, error1;
      try {
        return this.node.splat === true;
      } catch (error1) {
        error = error1;
        if (this.options.verbose) {
          return console.warn('Get parameter splat type error:', this.node, error);
        }
      }
    };

    return Parameter;

  })(Node);

}).call(this);