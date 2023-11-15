const fs = require("fs");
const path = require("path");

module.exports =
async function create(opts, content) {
  // This function creates markdown documents and rights them to the filesystem
  // according to the content provided.

  // By default, this may be configurable later on, we will create one file per class

  for (const classItem in content) {
    await generateMarkdownFile(opts, content[classItem]);
  }

  return;
}

async function generateMarkdownFile(opts, content) {

  let md = "";

  md += `# ${content.name}\n`;

  md += `\n> ${content.visibility}\n`;

  // if (hasContent(content.summary)) {
  //   md += `\n${content.summary}\n`;
  // }
  // It seems the summary is included in the description

  if (hasContent(content.description)) {
    md += `\n${content.description}\n`;
  }

  if (arrayHasContent(content.examples)) {
    md += generateExamples(content.examples);
  }

  if (arrayHasContent(content.classMethods)) {
    md += generateClassMethods(content.classMethods);
  }

  if (arrayHasContent(content.instanceMethods)) {
    md += generateInstanceMethods(content.instanceMethods);
  }

  if (arrayHasContent(content.classProperties)) {
    md += generateClassProperties(content.classProperties);
  }

  if (arrayHasContent(content.instanceProperties)) {
    md += generateInstanceProperties(content.instanceProperties);
  }

  // Now we could write the file or print it.
  // For now lets test write
  let filename = opts.name;
  let origExt = path.extname(content.filepath);
  let newFileName = content.filename.replace(origExt, ".md");
  let filePath = `${opts.outputDir}${path.sep}${newFileName}`;

  fs.writeFileSync(filePath, md, { encoding: "utf8" });
  console.log(`Successfully wrote: ${filePath}`);
  return;
}

function hasContent(value) {
  if (typeof value === "string" && value.length > 0) {
    return true;
  } else {
    return false;
  }
}

function arrayHasContent(value) {
  if (Array.isArray(value) && value.length > 0) {
    return true;
  } else {
    return false;
  }
}

function wrapNewLines(value) {
  // Surround content in newlines if there is content
  if (typeof value === "string" && value.length > 0) {
    return `\n${value}\n`;
  } else {
    return "";
  }
}
function generateExamples(examples) {
  let content = "";

  for (let i = 0; i < examples.length; i++) {
    content += `\n## Examples\n`;

    if (hasContent(examples[i].description)) {
      content += `\n${examples[i].description}\n`;
    }

    content += `\n\`\`\``;
    if (hasContent(examples[i].lang)) {
      content += examples[i].lang;
    }
    content += `\n${examples[i].code}\n\`\`\`\n`;
  }

  return content;
}

function generateClassMethods(content) {
  let md = "";

  md += `\n\n## Class Methods\n`;

  for (let i = 0; i < content.length; i++) {
    if (i !== 0) {
      // If this isn't the first iteration, add a breakline
      // to let the collapsible sections breath
      md += `<br/>`;
    }
    md += generateMethods(content[i]);
  }

  return md;
}

function generateInstanceMethods(content) {
  let md = "";

  md += `\n\n### Instance Methods\n`;

  for (let i = 0; i < content.length; i++) {
    if (i !== 0) {
      // If this isn't the first iteration, add a breakline
      // to let the collapsible sections breath
      md += `<br/>`;
    }
    md += generateMethods(content[i]);
  }

  return md;
}

function generateMethods(content) {
  return `
<details>
    <summary>\`${content.name}()\`: ${content.summary}</summary>
<br/>
${content.description}
${wrapNewLines(generateParameters(content.arguments))}
${wrapNewLines(generateReturns(content.returnValues))}
</details>
`;
}

function generateParameters(content) {
  if (arrayHasContent(content)) {
    let md = "### Parameters\n\n";

    for (let i = 0; i < content.length; i++) {
      md += `* \`${content[i].name}\``;

      if (content[i].isOptional) {
        md += ` (Optional)`;
      } else {
        md += ` (Required)`;
      }

      md += ` - ${content[i].type}\n\n`;
      md += `  ${content[i].description}\n\n`;
    }

    return md;

  } else {
    return "";
  }
}

function generateReturns(content) {
  if (arrayHasContent(content)) {
    let md = "### Returns\n\n";

    for (let i = 0; i < content.length; i++) {
      md += content[i].description;
      md += `\n`;
    }

    return md;
  } else {
    return "";
  }
}

function gnenerateClassProperties(content) {
  let md = "";

  md += `\n\n### Class Properties\n\n`;

  for (let i = 0; i < content.length; i++) {
    md += generateProperties(content[i]);
  }

  return md;
}

function generateInstanceProperties(content) {
  let md = "";

  md += `\n\n### Instance Properties\n\n`;

  for (let i = 0; i < content.length; i++) {
    md += generateProperties(content[i]);
  }

  return md;
}

function generateProperties(content) {
  return `* \`${content.name}\`\n\n  ${content.description}\n\n`;
}
