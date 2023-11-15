# pulsardoc

## Usage

```bash
pulsardoc <dir> <opts>
```

* First argument **must** be the path, if one is included, otherwise omitting the path will use the current working directory.
* Following arguments can then be a mix of the accepted arguments:
  - `--verbose` (`-v`): Sets the output to verbose.
  - `--format` (`-f`): Must be immediately followed by `=<method>`. This determines how the documentation is formatted.
  - `--output` (`-o`): Must be immediately followed by `=<location>`. This determines the folder the documentation is saved to.
* Valid Format Methods:
  - `--format=cmd`: Prints the content to the terminal.
  - `--format=html`: TBD
  - `--format=markdown`: Creates Markdown documents for each class.
  - `--format=json`: Saves the content as JSON, within the output directory as `api.json`.

Example Usage:

```bash
# Generate markdown content from a file named `test.js` and save it to a folder `docs`
pulsardoc test.js --format=markdown --output=./docs
```
