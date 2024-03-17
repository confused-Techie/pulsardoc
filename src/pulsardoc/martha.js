// Martha: The Tree-Sitter implementation of Joanna and Donna

module.exports =
function generate(code) {
  return new Generator(code).generate();
}

class Generator {
  constructor(code) {
    this.code = code;

    this.objects = {};
    this.exports = {};
    this.classStack = [];
    this.nodeStack = [];
  }

  generate() {
    this.visit(this.code.rootNode);
  }

  visit(node) {
    switch(node.constructor.name) {
      default:
        return this.visitNodeWithChildren(node);
    }
  }

  visitNodeWithChildren(node) {
    if (node.childCount > 0) {
      for (let i = 0; i < node.childCount; i++) {
        this.visit(node.child(i));
      }
    }
  }

  returnItems() {
    return {
      objects: this.objects,
      exports: this.exports
    };
  }
}
