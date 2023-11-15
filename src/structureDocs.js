
module.exports =
function structureDocs(opts, content) {
  // This function is aimed at taking the messy docs content, and creating something
  // that's much easier to consume, and more importantly, much easier to generate
  // output for.

  // Taking the output from `main.js` of:
  /**
   * The content below is each object of an array
   * file: "filename and path",
   * name: "filename",
   * comments: [ An array of the raw comments ],
   * parsedDocs: [
   * This will be an array of every doc object.
   * Refer to: https://github.com/pulsar-edit/atomdoc
   * For details about this object with different inputs
   * But remember that the new custom properties are available as well
   * ]
   */
  // And turning it into something more closely matching:
  // https://github.com/pulsar-edit/flight-manual.atom.io/blob/master/data/apis-by-version/v1.0.0.json

  let doc = {};

  for (let i = 0; i < content.length; i++) {
    // Here we are able to iterate through every file
    let currentClass;
    for (let y = 0; y < content[i].parsedDocs.length; y++) {
      // Here we are able to iterate through every doc generated from this file
      // That is every unique comment
      if (content[i].parsedDocs[y].type === "Class") {
        // We only care about classes here
        currentClass = new ClassBuilder();
        currentClass.filename = content[i].name;
        currentClass.filepath = content[i].file;
        currentClass.addPropertyList(content[i].parsedDocs[y]);
      } else {
        // We are assuming here that everything else in this file is a descendent
        // of this class, until we reach another class
        if (typeof currentClass.addItem === "function") {
          currentClass.addItem(content[i].parsedDocs[y]);
        } else {
          console.error("We've encountered docs that couldn't fit into a class!");
          console.error("These docs will be pruned!");
          console.error(`Doc: ${content[i].parsedDocs[y].name}`);
        }
      }
    }
    // After parsing is done for this file, lets add the class to our above tree
    doc[currentClass.name] = currentClass.build();
    currentClass = null;
  }

  return doc;
}

class ClassBuilder {
  constructor() {
    // Meta Properties
    this.filename;
    this.filepath;

    // Class Properties
    this.name = "Anonymous Class";
    this.superClass;
    this.sections = [];
    this.classMethods = [];
    this.instanceMethods = [];
    this.classProperties = [];
    this.instanceProperties = [];
    this.visibility;
    this.summary;
    this.description;
    this.examples = [];
  }

  build() {
    // Turn all of our data into JSON
    let outObj = {};

    if (typeof this.name === "string") {
      outObj.name = this.name;
    } else {
      outObj.name = "Anonymous Class";
    }
    if (typeof this.superClass === "string") {
      outObj.superClass = this.superClass;
    }
    if (typeof this.visibility === "string") {
      outObj.visibility = this.visibility;
    }
    if (typeof this.summary === "string") {
      outObj.summary = this.summary;
    } else {
      outObj.summary = "";
    }
    if (typeof this.description === "string") {
      outObj.description = this.description;
    } else {
      outObj.description = "";
    }
    if (this.classMethods.length > 0) {
      let tmpArr = [];
      for (let i = 0; i < this.classMethods.length; i++) {
        tmpArr.push(this.classMethods[i].build());
      }
      outObj.classMethods = tmpArr;
    } else {
      outObj.classMethods = [];
    }
    if (this.instanceMethods.length > 0) {
      let tmpArr = [];
      for (let i = 0; i < this.instanceMethods.length; i++) {
        tmpArr.push(this.instanceMethods[i].build());
      }
      outObj.instanceMethods = tmpArr;
    } else {
      outObj.instanceMethods = [];
    }
    if (this.instanceProperties.length > 0) {
      let tmpArr = [];
      for (let i = 0; i < this.instanceProperties.length; i++) {
        tmpArr.push(this.instanceProperties[i].build());
      }
      outObj.instanceProperties = tmpArr;
    } else {
      outObj.instanceProperties = [];
    }
    if (this.classProperties.length > 0) {
      let tmpArr = [];
      for (let i = 0; i < this.classProperties.length; i++) {
        tmpArr.push(this.classProperties[i].build());
      }
      outObj.classProperties = tmpArr;
    } else {
      outObj.classProperties = [];
    }
    // Add standard objects
    outObj.sections = this.sections;
    outObj.examples = this.examples;
    outObj.filename = this.filename;
    outObj.filepath = this.filepath;

    return outObj;
  }

  addExampleValue(obj) {
    if (
      typeof obj.description === "string"
      && typeof obj.lang === "string"
      && typeof obj.code === "string"
      && typeof obj.raw === "string"
    ) {
      // This object seems valid and complete, lets add it
      this.examples.push(obj);
    }
  }

  addSection(val) {
    if (typeof val === "string" && !this.sections.includes(val)) {
      this.sections.push(val);
    }
  }

  addItem(obj) {
    // Here we are passed any possible child item of this class. And we must determine
    // what it is, and handle it's addition to the class builder
    let builder, addBuilderPropName;

    switch(obj.type) {
      case "InstanceMethod":
        builder = new MethodBuilder();
        addBuilderPropName = "instanceMethods";
        break;
      case "ClassMethod":
        builder = new MethodBuilder();
        addBuilderPropName = "classMethods";
        break;
      case "ClassProperty":
        builder = new PropertyBuilder();
        addBuilderPropName = "classProperties";
        break;
      case "InstanceProperty":
        builder = new PropertyBuilder();
        addBuilderPropName = "instanceProperties";
        break;
      default:
        console.log(`An item couldn't fit into a class! ${obj.name}`);
        builder = false;
        break;
    }

    if (typeof builder === "boolean" && !builder) {
      return;
    }
    // Now to add all the properties to this builder

    builder.type = obj.type;
    builder.parent = this;
    builder.addPropertyList(obj);

    // Now to add the builder back to our list
    this[addBuilderPropName].push(builder);
  }

  addPropertyList(obj) {
    // This takes a list of items, and adds them if compatible
    for (const prop in obj) {
      if (prop === "name") {
        this.name = obj[prop];
      } else if (prop === "summary") {
        this.summary = obj[prop];
      } else if (prop === "description") {
        this.description = obj[prop];
      } else if (prop === "visibility") {
        this.visibility = obj[prop];
      } else if (prop === "superClass") {
        this.superClass = obj[prop];
      } else if (prop === "examples") {
        if (Array.isArray(obj[prop])) {
          for (let i = 0; i < obj[prop].length; i++) {
            this.addExampleValue(obj[prop][i]);
          }
        }
      }
    }
  }

}

class MethodBuilder {
  constructor() {
    // Meta Properties
    this.parent;
    this.type;

    // Method Properties
    this.name;
    this.sectionName = null;
    this.visibility;
    this.summary;
    this.description;
    this.arguments = [];
    this.returnValues = [];
  }

  build() {
    // Turn all of our data into a JSON object
    let outObj = {};

    if (typeof this.name === "string") {
      outObj.name = this.name;
    } else {
      outObj.name = type;
    }
    if (typeof this.visibility === "string") {
      outObj.visibility = this.visibility;
    }
    if (typeof this.summary === "string") {
      outObj.summary = this.summary;
    }
    if (typeof this.description === "string") {
      outObj.description = this.description;
    }
    // Add generics
    outObj.sectionName = this.sectionName;
    outObj.arguments = this.arguments;
    outObj.returnValues = this.returnValues;

    return outObj;
  }

  addReturnValue(obj) {
    if (obj.type === null && typeof obj.description === "string" && obj.description.length == 0) {
      // Don't add this empty return value
      return;
    }
    // We will assume it's valid
    this.returnValues.push(obj);
  }

  addArgumentValue(obj) {
    if (obj.name && obj.description && obj.type && typeof obj.isOptional === "boolean") {
      // This object is most likely valid, and complete
      this.arguments.push(obj);
    }
  }

  addPropertyList(obj) {
    // This takes a list of items, and adds them if compatible
    for (const prop in obj) {
      if (prop === "sectionName") {
        this.sectionName = obj[prop];
        this.parent.addSection(obj[prop]);
      } else if (prop === "visibility") {
        this.visibility = obj[prop];
      } else if (prop === "returnValues") {
        if (Array.isArray(obj[prop])) {
          for (let i = 0; i < obj[prop].length; i++) {
            this.addReturnValue(obj[prop][i]);
          }
        }
      } else if (prop === "summary") {
        this.summary = obj[prop];
      } else if (prop === "description") {
        this.description = obj[prop];
      } else if (prop === "name") {
        this.name = obj[prop];
      } else if (prop === "arguments") {
        if (Array.isArray(obj[prop])) {
          for (let i = 0; i < obj[prop].length; i++) {
            this.addArgumentValue(obj[prop][i]);
          }
        }
      }
    }
  }
}

class PropertyBuilder {
  constructor() {
    // Meta Properties
    this.parent;
    this.type;

    // Property Properties
    this.name;
    this.visibility;
    this.summary;
    this.description;
  }

  build() {
    let outObj = {};

    if (typeof this.name === "string") {
      outObj.name = this.name;
    } else {
      outObj.name = `Anonymous ${this.kind}`;
    }
    if (typeof this.summary === "string") {
      outObj.summary = this.summary;
    } else {
      outObj.summary = "";
    }
    if (typeof this.description === "string") {
      outObj.description = this.description;
    } else {
      outObj.description = "";
    }

    // Generic Properties
    outObj.visibility = this.visibility;

    return outObj;
  }

  addPropertyList(obj) {
    // This takes a list of items, and adds them if compatible
    for (const prop in obj) {
      if (prop === "name") {
        this.name = obj[prop];
      } else if (prop === "summary") {
        this.summary = obj[prop];
      } else if (prop === "description") {
        this.description = obj[prop];
      } else if (prop === "visibility") {
        this.visibility = obj[prop];
      }
    }
  }
}
