# Python syntax highlighting

All four Programming Studio themes now have distinct lexical token palettes:
keywords, comments, function calls and declarations, identifiers, strings,
numbers, operators and three alternating bracket nesting colours. The colours
are inspired by VS Code and adapted for contrast rather than an exact copy.

A lightweight TypeScript lexer generates escaped React text spans under the
native textarea. The editor retains its original controlled source, keyboard
shortcut, native selection and editing, and scroll-synchronised line numbers.
The highlight layer is hidden from assistive technology and disabled in
operating-system forced-colour mode. No dependencies, runtime, API permissions
or authentication policies change.

The lexer is intended for visual reading, not Python semantic analysis.
Identifiers are coloured as variables unless followed by a call parenthesis;
f-string bodies are coloured as strings, and contextual keywords are not
fully parsed. It does not provide IntelliSense, lint diagnostics or code
execution. Tests cover text preservation, comments, escaped and incomplete
strings, nested brackets and per-theme computed colours.
