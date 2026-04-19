# Plain HTML/CSS/JavaScript Version

This folder contains a standalone implementation of the Pipeline Hazard Simulator using only:

- HTML
- CSS
- JavaScript

No React, TypeScript, Vite, Node.js, or npm are required.

## How to Run

Open this file in a browser:

```text
plain-js/index.html
```

For example, from the project root:

```bash
xdg-open plain-js/index.html
```

If `xdg-open` is not available, open the file manually from your file browser.

## Features

- Editable instruction list with a maximum of 10 instructions.
- Every instruction row is a typeable dropdown for complete instruction templates.
- Supported instructions: `ADD`, `SUB`, `LW`, `SW`.
- Supports registers `R0` through `R31`.
- Supports signed offsets such as `LW R1, -4(R2)`.
- 4-stage mode: `IF`, `ID`, `EX`, `MEM/WB`.
- 5-stage mode: `IF`, `ID`, `EX`, `MEM`, `WB`.
- Baseline RAW hazard stalls.
- Forwarding mode.
- Split register access toggle.
- Step, run/pause, and reset controls.
- Explicit `STALL` cells.
- RAW hazard explanation panel.
- Built-in example programs for report screenshots.

## Best Report Wording

The project was implemented as a browser-based simulator using HTML, CSS, and JavaScript. JavaScript handles instruction parsing, RAW dependency detection, stall insertion, forwarding behavior, and cycle-by-cycle trace generation. HTML and CSS implement the instruction editor, controls, hazard panel, and pipeline execution table.

Timing note: with forwarding disabled and split register access disabled, `LW R1, 10(R2)` followed by `ADD R3, R1, R5` produces 3 stalls. With forwarding enabled and split register access enabled, the same load-use dependency produces the note-style `IF ID STALL EX ...` sequence with 1 stall.
