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

- [ ] Ability to generate JSON documentation from single easy function call
- [ ] Support modern ECMAScript Features
- [ ] Support either JavaScript or CoffeeScript without issue
- [ ] Support original Markdown directives
- [ ] Support JSDoc Directives

While Atom's Documentation system was born of a want to document code using Markdown, this one should continue this and expand on it.
Bringing JSDoc features to the schema these tools expect, so they can continue to be used with existing tool-chains.
