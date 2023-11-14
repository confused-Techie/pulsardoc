const path = require("path");
const process = require("node:process");

module.exports =
function parseArgs(args) {
  let dir;
  let verbose = false;
  let output = "cmd";
  const validOutputs = [ "cmd", "html", "markdown", "json" ];

  if (args.length === 0) {
    // No directory was passed. So we will use the current working directory
    dir = process.cwd();
  } else if (args[0] === ".") {
    // Since this means the current dir we will do the same as above
    dir = process.cwd();
  } else if (args[0].startsWith(".")) {
    // The user has provided a local path
    dir = path.resolve(args[0]);
  } else {
    // The user has provided somethign else, that we will assume is a full path
    // TODO look for other possible arguments here, such as verbose and what not
    dir = args[0];
    if (!args[0].startsWith("-")) {
      // We know that this is supposed to reference a regular dir
      dir = args[0];
    } else {
      // If the first argument isn't a path, then we know none was included
      dir = process.cwd();
    }
  }

  // Now we can parse all other args
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("-")) {
      switch(args[i]) {
        case "--verbose":
        case "-v":
          verbose = true;
          break;
        case "--output":
        case "-o":
          let outputParts = args[i].split("=");
          if (!validOutputs.includes(outputParts[1])) {
            // The provided output object isn't valid, default
            output = "cmd";
          } else {
            // The output provided is valid
            output = outputParts[1];
          }
          break;
      }
    }
  }

  return {
    directory: dir,
    verbose: verbose,
    output: output
  };
}
