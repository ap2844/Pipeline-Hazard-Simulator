# Pipeline Hazard Simulator

[Live Demo](https://ap2844.github.io/Pipeline-Hazard-Simulator/) | [Source Code](https://github.com/ap2844/Pipeline-Hazard-Simulator) | [Test Cases](docs/test-cases.md) | [Notes Verification](docs/notes-verification.md)

This is the plain HTML/CSS/JavaScript implementation of the FoCS Pipeline Hazard Simulator assignment.

Public repository:

```text
https://github.com/ap2844/Pipeline-Hazard-Simulator
```

Live demo:

```text
https://ap2844.github.io/Pipeline-Hazard-Simulator/
```

The runnable app is here:

```text
plain-js/index.html
```

## What It Shows

The simulator visualizes how instructions move through a single-issue, in-order pipeline. It highlights RAW hazards, renders inserted delays as explicit `STALL` cells, and lets forwarding visibly reduce stalls where the lecture notes say forwarding should help.

Good demo sequence:

1. Open the live demo.
2. Click `Load-use hazard`.
3. Step through the pipeline with forwarding off and split register access off.
4. Turn forwarding and split register access on.
5. Compare the stall count and hazard explanation panel.

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
- Instruction input is case-insensitive and normalizes to canonical uppercase formatting.
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
- Clean black-and-green terminal theme with restrained CRT scanlines.

## Project Layout

```text
index.html            GitHub Pages redirect to the simulator
plain-js/index.html   Page structure
plain-js/styles.css   Visual design and responsive layout
plain-js/app.js       Parser, scheduler, hazards, controls, and rendering
plain-js/README.md    Notes for the plain-JS version
docs/assumptions.md   Simulator assumptions and timing model
docs/test-cases.md    Manual verification cases
docs/notes-verification.md  Cross-check against the assignment and hazard notes
```

## Report 

The project was implemented as a browser-based simulator using HTML, CSS, and JavaScript. JavaScript handles instruction parsing, RAW dependency detection, stall insertion, forwarding behavior, and cycle-by-cycle trace generation. HTML and CSS implement the instruction editor, controls, hazard panel, and pipeline execution table.

Timing note: with forwarding disabled and split register access disabled, `LW R1, 10(R2)` followed by `ADD R3, R1, R5` produces 3 explicit `STALL` cells. With forwarding enabled and split register access enabled, the same load-use dependency produces 1 `STALL` cell before `EX`.
