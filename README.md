# pulsardoc

A reimagining of the Atom documentation system.

Previously Atom would utilize:

  * [`joanna`](https://github.com/atom/joanna/tree/master): Gathers metadata to generate JavaScript docs
  * [`donna`](https://github.com/atom/donna/tree/master): CoffeeScript API docs
  * [`tello`](https://github.com/atom/tello/tree/master): Digest for Donna metadata

As well as:

  * [`atomdoc`](https://github.com/atom/atomdoc): Atom's documentation parser for JavaScript/CoffeeScript
  * [`grunt-atomdoc`](https://github.com/atom/grunt-atomdoc): Grunt task to generate atomdoc

Which had to be used together in somewhat mysterious ways that in the end generate beautiful JSON representations of their codebase.

The goal of `pulsardoc` is to achieve this again, but with some important changes:

- [X] Ability to generate JSON documentation from single easy function call
- [ ] Support modern ECMAScript Features
- [ ] Support either JavaScript or CoffeeScript without issue
- [X] Support original Markdown directives
- [X] Support a subset of JSDoc Directives

While Atom's Documentation system was born of a want to document code using Markdown, this one should continue this and expand on it.
Bringing JSDoc features to the schema these tools expect, so they can continue to be used with existing tool-chains.

## Usage

To use:

```js
const opts = {
  // Currently displaying defaults
  warn_on_unrecognized_file: false, // warn if we encounter a file extension that we won't/can't handle
  write_temp_files: false // write temp files to disk: parsed.json, digested.json, jsdocified.json
};

const docs = new PulsarDoc([ "path/one", "path/two" ], opts).main();
```

## Documentation

### AtomDoc

AtomDoc refers to the syntax of documentation necessary for documenting code as originally intended by the Atom team.
Which this generator still follows exactly.


### JSDoc

JSDoc refers to the JSDoc extension within this generator. While `pulsardoc` doesn't support JSDoc style documentation exactly, it supports JSDoc style declarations.

What this means is that although all documentation must still be placed in single line comments, and **must** begin with an API Status string, you are able to in addition to use declarations in JSDoc style for a subset of items.

When using JSDoc style declarations ensure the following:
  * Each JSDoc declaration is on it's own line.
  * It is a single line comment, not a comment block
  * The value itself is a single line only.

Currently supported items are:

### Name

Maps to the `name` property.

```js
// @name aNameValue
```

### Summary

Maps to the `summary` property.

```js
// @summary A Summary String.
```

### Description

Maps to the `description` property.

```js
// @description A Description String.
```
