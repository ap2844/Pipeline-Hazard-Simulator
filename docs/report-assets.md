# Report Assets Checklist

Use this checklist to capture screenshots and an optional GIF for the final report and GitHub README.

Live app:

```text
https://ap2844.github.io/Pipeline-Hazard-Simulator/
```

Local app:

```bash
cd plain-js
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Screenshots to Capture

Save screenshots in:

```text
docs/screenshots/
```

Recommended filenames:

- `instruction-editor.png`: show the typeable dropdown instruction editor with one example loaded.
- `four-stage.png`: show 4-stage mode with the `MEM/WB` stage visible.
- `five-stage.png`: show 5-stage mode with separate `MEM` and `WB` stages visible.
- `baseline-stalls.png`: show a RAW hazard with forwarding off and visible `STALL` cells.
- `forwarding-comparison.png`: show the same program after forwarding reduces stalls.
- `hazard-panel.png`: show producer, consumer, register, stall count, and resolution.

## Optional Demo GIF

Recommended filename:

```text
docs/screenshots/demo.gif
```

Suggested GIF flow:

1. Load `Load-use hazard`.
2. Step until the first `STALL` appears.
3. Toggle `Forwarding` and `Split reg`.
4. Reset and step again to show the shorter forwarding schedule.

## README Image Block

After adding screenshots, paste this block into `README.md` below the "Screenshots and Demo GIF" heading:

```md
![Pipeline Hazard Simulator demo](docs/screenshots/demo.gif)

| Baseline stalls | Forwarding comparison |
| --- | --- |
| ![Baseline stalls](docs/screenshots/baseline-stalls.png) | ![Forwarding comparison](docs/screenshots/forwarding-comparison.png) |
```

## Report Wording

The live version of the simulator is hosted through GitHub Pages at:

```text
https://ap2844.github.io/Pipeline-Hazard-Simulator/
```

The source code is available at:

```text
https://github.com/ap2844/Pipeline-Hazard-Simulator
```
