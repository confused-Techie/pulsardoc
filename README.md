# pulsardoc

## Usage

```
pulsardoc <dir> <opts>
```

* First argument **must** be the path, if one is included, otherwise omitting the path will use the current working directory.
* Following arguments can then be a mix of the accepted arguments:
  - `--verbose` (`-v`): Sets the output to verbose.
  - `--output` (`-o`): Must be immediately followed by `=<method>`. This determines how the documentation is output.
* Valid Output Methods:
  - `--output=cmd`: Prints the output to the terminal.
  - `--output=html`: TBD
  - `--output=markdown`: TBD
  - `--output=json`: TBD
