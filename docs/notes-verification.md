# Notes Verification

This file records how the simulator was checked against `Lab Assignment II.pdf`, `Data Hazards.pdf`, and `FoCS_Hazards_Extra_Questions.pdf`.

## Covered Directly

- `Lab Assignment II.pdf` requires a single-issue, in-order graphical simulator with at most 10 instructions. The plain JS app supports add/remove/edit, a hard 10-instruction cap, step, run/pause, reset, and a cycle-by-cycle table.
- The assignment-required instructions are `ADD`, `SUB`, `LW`, and `SW`. The parser accepts those four forms and rejects unsupported syntax.
- The assignment-required pipeline modes are present:
  - 4-stage: `IF`, `ID`, `EX`, `MEM/WB`
  - 5-stage: `IF`, `ID`, `EX`, `MEM`, `WB`
- `Data Hazards.pdf` defines RAW, WAR, and WAW. The app models RAW hazards because the assignment explicitly makes RAW the required baseline scope.
- ALU-to-ALU forwarding from the notes is modeled as zero extra stalls.
- Load-use forwarding from the notes is modeled as one required stall.
- No-forwarding RAW hazards stall until the producer writeback point.

## Matching Note Examples

The notes write stall cycles as `STALL`. The app keeps the same convention and displays inserted RAW delays as explicit `STALL` cells.

### Load followed by dependent ADD

Program:

```asm
LW R1, 10(R2)
ADD R3, R1, R5
```

Without forwarding and without split register access:

```text
LW   IF ID EX MEM WB
ADD     IF STALL STALL STALL ID EX MEM
```

Expected stall count: `3`.

With forwarding and split register access:

```text
LW   IF ID EX MEM WB
ADD     IF ID STALL EX MEM
```

Expected stall count: `1`.

### Arithmetic RAW

Program:

```asm
ADD R1, R2, R3
SUB R4, R1, R5
```

- With forwarding: `0` extra stalls, matching the EX-to-EX forwarding examples.
- Without forwarding and with split register access: `2` stalls, matching the extra-question note that same-cycle write/read allows the consumer to decode in the producer's WB cycle.
- Without forwarding and without split register access: `3` stalls, matching the stricter no-split rule.

## Outside App Scope

- `MUL` and `OR` examples in the extra-question PDF are not implemented because the assignment only requires `ADD`, `SUB`, `LW`, and `SW`.
- Structural hazards and unified-memory conflicts are explained in the extra notes, but the assignment scope says RAW hazards are the required hazard type. The app does not claim structural-hazard support.
- WAR and WAW are identified conceptually in the notes, but the app does not stall for them because the assignment's in-order baseline does not require them.
