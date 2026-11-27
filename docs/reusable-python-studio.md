# Reusable Python Studio

The Programming Studio is a general-purpose, blank Python workspace with no
fixed module, exercise, challenge or starter solution. It keeps the themes,
syntax colours, package manager and interactive terminal.

## Markdown integration

In the administrator Study Notes Studio, use Insert Python Studio or add a
top-level fenced block manually:

````markdown
## Numerical example

```python-run
mass = 5
force = 20
print(force / mass)
```
````

The code is the starting content, not an automatically executed script.
An empty python-run fence opens a blank editor. Standard python fences
remain ordinary code blocks. Preview, then Open Python Studio to run and
edit the code. Reset restores the authored source; closing discards the
session and edits. Separate blocks have independent interpreter state.
Only open the studios needed for a presentation to limit device memory.

The same Markdown renderer is available in Administration Centre → Labs —
private preview → Markdown Presenter (/admin/labs/presenter). Paste notes
or assessments for any module and select Present Markdown. This presenter
does not save, publish, submit or grade assessments.

## Release boundary

Only the verified administrator preview opts into interactive blocks.
Learner-facing notes display the fenced code as static text, with no Run
control. The sandbox endpoint and standalone workspace remain administrator
only. No permissions, assessment records or database policies are changed.
An assessment-specific publishing/grading workflow is outside this change.

The renderer retains the existing GFM and math support. Top-level fenced
blocks preserve literal code rather than normalizing its LaTeX-like escapes.
Source limits are 20,000 characters per studio and 70,000 per note.
