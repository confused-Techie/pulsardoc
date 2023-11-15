const path = require("path");
const process = require("node:process");

module.exports =
function parseArgs(args) {
  let dir;
  let verbose = false;
  let format = "cmd";
  let outputDir;
  const validFormats = [ "cmd", "html", "markdown", "json" ];

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
      let argsParts = args[i].split("=");
      // Only actually required if there's a value here, which not everything has
      switch(argsParts[0]) {
        case "--verbose":
        case "-v":
          verbose = true;
          break;
        case "--format":
        case "-f":
          if (!validFormats.includes(argsParts[1])) {
            // The provided format object isn't valid, default
            format = "cmd";
          } else {
            // The format provided is valid
            format = argsParts[1];
          }
          break;
        case "--output":
        case "-o":
          if (typeof argsParts[1] === "string") {
            outputDir = path.resolve(argsParts[1]);
          }
      }
    }
  }

  return {
    directory: dir,
    verbose: verbose,
    format: format,
    outputDir: outputDir ?? process.cwd()
  };
}
