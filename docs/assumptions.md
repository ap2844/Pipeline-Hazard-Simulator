# Simulator Assumptions

- The simulator models instruction timing and hazards, not register or memory values.
- The pipeline is single-issue and in-order.
- Only RAW hazards are modeled because the assignment excludes control and structural hazards.
- `ADD` and `SUB` write their destination after the writeback point.
- `LW` writes its destination after memory data is available.
- `SW` does not write a destination register.
- Split register access is configurable. When it is off, a consumer cannot read in the same cycle as producer WB, so no-forwarding dependencies require one extra stall.
- When forwarding is off and split register access is off, `LW R1, 10(R2)` followed by `ADD R3, R1, R5` produces 3 stalls.
- When forwarding is on and split register access is on, a load-use dependency produces 1 stall.
- Forwarding is modeled as a timing improvement in the schedule and hazard explanation, not as a datapath animation.
- Empty table cells mean the instruction has not started yet or has already completed.
- Inserted delays are counted as stalls and rendered as explicit `STALL` cells.
- In a cycle with a `STALL`, younger instructions below that stalled row are rendered blank for that same cycle.
