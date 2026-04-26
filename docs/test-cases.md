# Test Cases and Report Evidence

Use these cases to verify the simulator behavior. Each case is represented in the built-in example buttons in `plain-js/index.html`.

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

Recommended check:

- Load the "No dependencies" example.
- Run one 5-stage trace near the final cycle and confirm no stalls are inserted.

## 2. Arithmetic RAW

Program:

```asm
ADD R1, R2, R3
SUB R4, R1, R5
ADD R6, R7, R8
```

Expected behavior without forwarding:

- `I2` depends on `I1` through `R1`.
- 5-stage baseline inserts three stalls when split register access is off.
- 5-stage baseline inserts two stalls when split register access is on.
- 4-stage baseline inserts two stalls when split register access is off.
- 4-stage baseline inserts one stall when split register access is on.

Expected behavior with forwarding:

- The dependency is still detected.
- ALU forwarding avoids the stall.

Recommended check:

- Compare the 5-stage baseline with the same case after forwarding is enabled.
- Confirm the forwarding run has fewer stalls.

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

Recommended check:

- Enable forwarding and step to the first `STALL` cell.
- Confirm the hazard explanation panel reports the load-use stall.

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

Recommended check:

- Compare the summary cards and pipeline table before and after enabling forwarding.

## Acceptance Checklist

- Open `plain-js/index.html` directly in a browser, or run `python3 -m http.server 8000` from `plain-js/` and open `http://localhost:8000`.
- The app rejects invalid instructions with a clear message.
- The instruction editor does not allow more than 10 instructions.
- Each instruction can be typed manually or selected from the row's typeable dropdown.
- Step, run/pause, and reset do not delete the program.
- 4-stage and 5-stage modes produce visibly different schedules when hazards require stalls.
- Forwarding changes the schedule for arithmetic RAW dependencies and is listed in the hazard panel.
- Final submission includes a PDF report with assumptions, run instructions, and these test cases.
