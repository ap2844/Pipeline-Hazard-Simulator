# Pipeline Hazard Simulator

This is the plain HTML/CSS/JavaScript implementation of the FoCS Pipeline Hazard Simulator assignment.

The runnable app is here:

```text
plain-js/index.html
```

## How to Run

Open the file directly in a browser:

```bash
xdg-open plain-js/index.html
```

If `xdg-open` is unavailable, open `plain-js/index.html` manually from your file browser.

Optional local server:

```bash
cd plain-js
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Features

- Up to 10 editable instructions.
- Every instruction row is a typeable dropdown for complete instruction templates.
- Supported instructions: `ADD`, `SUB`, `LW`, `SW`.
- Register syntax: `R0` through `R31`, case-insensitive.
- Memory syntax: `LW R1, 0(R2)` and `SW R1, -4(R2)`.
- 4-stage pipeline: `IF`, `ID`, `EX`, `MEM/WB`.
- 5-stage pipeline: `IF`, `ID`, `EX`, `MEM`, `WB`.
- Baseline RAW hazard stalls.
- Forwarding mode.
- Split register access toggle.
- Step, run/pause, and reset controls.
- Pipeline table, hazard explanations, total cycle count, and stall count.

## Project Layout

```text
plain-js/index.html   Page structure
plain-js/styles.css   Visual design and responsive layout
plain-js/app.js       Parser, scheduler, hazards, controls, and rendering
plain-js/README.md    Notes for the plain-JS version
docs/notes-verification.md  Cross-check against the assignment and hazard notes
```

## Report Wording

The project was implemented as a browser-based simulator using HTML, CSS, and JavaScript. JavaScript handles instruction parsing, RAW dependency detection, stall insertion, forwarding behavior, and cycle-by-cycle trace generation. HTML and CSS implement the instruction editor, controls, hazard panel, and pipeline execution table.

Timing note: with forwarding disabled and split register access disabled, `LW R1, 10(R2)` followed by `ADD R3, R1, R5` produces 3 stalls. With forwarding enabled and split register access enabled, the same load-use dependency produces the note-style `IF ID STALL EX ...` sequence with 1 stall.
