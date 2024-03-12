const util = require("util");

const PulsarDoc = require("./src/index.js");

const doc = new PulsarDoc([ "../pulsar-documentation-eleventy/pulsar/src/color.js" ], {
  warn_on_unrecognized_file: true
});

const docs = doc.main();

console.log(util.inspect(docs, false, null, true));
