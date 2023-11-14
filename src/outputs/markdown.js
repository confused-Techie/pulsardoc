
module.exports =
async function create(opts, content) {
  // This function creates markdown documents and rights them to the filesystem
  // according to the content provided.

  for (let file = 0; file < content.length; file++) {
    await createMdFile(opts, content[file]);
  }

  return;
}

async function createMdFile(opts, file) {
  let sections = [];

  for (let i = 0; i < file.parsedDocs.length; i++) {
    let section = await createMdSection(opts, file.parsedDocs[i]);
    sections.push(section);
  }

  // Then stitch together sections to create a doc, and save it's content
}

async function createMdSection(opts, section) {
  
}
