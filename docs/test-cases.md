# Test Cases and Report Evidence

Use these cases in the final report screenshots. Each case is represented in the built-in example buttons in `plain-js/index.html`.

Live demo for report and sharing:

```text
https://ap2844.github.io/Pipeline-Hazard-Simulator/
```

Source repository:

```text
https://github.com/ap2844/Pipeline-Hazard-Simulator
```

## 1. No Dependencies

Program:

```asm
ADD R1, R2, R3
SUB R4, R5, R6
LW R7, 0(R8)
SW R9, 4(R10)
```

Expected behavior:

- No RAW hazards.
- No `STALL` cells.
- Both 4-stage and 5-stage modes show smooth overlapping execution.

Recommended screenshot:

- Load the "No dependencies" example.
- Capture one 5-stage run near the final cycle.

## 2. Arithmetic RAW

Program:

```asm
ADD R1, R2, R3
SUB R4, R1, R5
ADD R6, R7, R8
```

Expected behavior without forwarding:

- `I2` depends on `I1` through `R1`.
- 5-stage baseline inserts two stalls.
- 4-stage baseline inserts one stall.

Expected behavior with forwarding:

- The dependency is still detected.
- ALU forwarding avoids the stall.

Recommended screenshot:

- Capture 5-stage baseline with visible `STALL` cells.
- Capture the same case with forwarding enabled and fewer stalls.

## 3. Load-Use Hazard

Program:

```asm
LW R1, 10(R2)
ADD R3, R1, R5
SUB R6, R7, R8
```

Expected behavior without forwarding:

- `I2` depends on the loaded value from `I1`.
- 5-stage baseline inserts three stalls when split register access is off.
- 5-stage baseline inserts two stalls when split register access is on.

Expected behavior with forwarding:

- The load-use dependency still requires one stall.
- The dependent instruction displays the note-style sequence `IF ID STALL EX ...`.
- The hazard panel reports `load use stall`.

Recommended screenshot:

- Capture forwarding enabled after stepping to the first `STALL` cell.
- Capture the hazard explanation panel.

## 4. Forwarding Comparison

Program:

```asm
ADD R1, R2, R3
ADD R4, R1, R5
LW R6, 0(R4)
SUB R7, R6, R8
```

Expected behavior:

- Baseline mode shows stalls from both ALU and load dependencies.
- Forwarding removes the ALU stall but keeps the load-use stall.
- Total cycles and stall count decrease when forwarding is enabled.

Recommended screenshot:

- Capture summary cards and pipeline table before and after enabling forwarding.

## Screenshot Checklist

- Instruction editor with at least one example loaded.
- 4-stage mode showing `MEM/WB`.
- 5-stage mode showing separate `MEM` and `WB`.
- Baseline RAW stall table.
- Forwarding-enabled comparison table.
- Hazard explanation panel.
- Summary cards with total cycles and stall count.

## Acceptance Checklist

- Open `plain-js/index.html` directly in a browser, or run `python3 -m http.server 8000` from `plain-js/` and open `http://localhost:8000`.
- The app rejects invalid instructions with a clear message.
- The instruction editor does not allow more than 10 instructions.
- Each instruction can be typed manually or selected from the row's typeable dropdown.
- Step, run/pause, and reset do not delete the program.
- 4-stage and 5-stage modes produce visibly different schedules when hazards require stalls.
- Forwarding changes the schedule for arithmetic RAW dependencies and is listed in the hazard panel.
- Final submission includes a PDF report with assumptions, screenshots, run instructions, and these test cases.
