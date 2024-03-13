
module.exports =
function consumeJsDoc(content) {
  // we are receiving a fully decoded object, ready for prime time as a JSON
  // representation of an API
  // so lets iterate and see if we can find any JSDoc items to add

  const newContent = content;

  for (const apiClass in newContent.classes) {
    let jsDocItems = findJsDocItems(newContent.classes[apiClass]);

    if (jsDocItems.name) {
      content.classes[apiClass].name = jsDocItems.name;
    }
    if (jsDocItems.description) {
      content.classes[apiClass].description = jsDocItems.description;
    }
    if (jsDocItems.summary) {
      content.classes[apiClass].summary = jsDocItems.summary;
    }

    discoverWithin("classMethods", apiClass, newContent);
    discoverWithin("instanceMethods", apiClass, newContent);
    discoverWithin("classProperties", apiClass, newContent);
    discoverWithin("instanceProperties", apiClass, newContent);
  }

  return newContent;
}

function discoverWithin(prop, apiClass, content) {
  for (let i = 0; i < content.classes[apiClass][prop].length; i++) {
    let jsDocItems = findJsDocItems(content.classes[apiClass][prop][i]);

    if (jsDocItems.name) {
      content.classes[apiClass][prop][i].name = jsDocItems.name;
    }
    if (jsDocItems.description) {
      content.classes[apiClass][prop][i].description = jsDocItems.description;
    }
    if (jsDocItems.summary) {
      content.classes[apiClass][prop][i].summary = jsDocItems.summary;
    }

  }
}

function findJsDocItems(obj) {
  let text = obj.description; // TODO do we care about the summary? These are usually identical

  let found = {};

  let textFragments = text.split(/\r?\n/);

  for (let i = 0; i < textFragments.length; i++) {
    let line = textFragments[i].trim();

    if (line.startsWith("@name")) {
      found.name = line.replace("@name", "").trim(); // add the found value to our found object
      obj.description = obj.description.replace(line, ""); // remove declarators content from description
      obj.summary = obj.summary.replace(line, ""); // remove declarators content from summary
    }

    if (line.startsWith("@description")) {
      found.description = line.replace("@description", "").trim();
      obj.description = obj.description.replace(line, "");
      obj.summary = obj.summary.replace(line, "");

    }

    if (line.startsWith("@summary")) {
      found.summary = line.replace("@summary", "").trim();
      found.description = obj.description.replace(line, "");
      found.summary = obj.summary.replace(line, "");
    }
  }

  return found;
}
