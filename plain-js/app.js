const examples = [
  {
    id: "no-deps",
    name: "No dependencies",
    description: "Independent arithmetic and memory operations should flow without stalls.",
    lines: ["ADD R1, R2, R3", "SUB R4, R5, R6", "LW R7, 0(R8)", "SW R9, 4(R10)"]
  },
  {
    id: "alu-raw",
    name: "Arithmetic RAW",
    description: "I2 reads R1 immediately after I1 writes it.",
    lines: ["ADD R1, R2, R3", "SUB R4, R1, R5", "ADD R6, R7, R8"]
  },
  {
    id: "load-use",
    name: "Load-use hazard",
    description: "A loaded value is consumed by the next instruction.",
    lines: ["LW R1, 10(R2)", "ADD R3, R1, R5", "SUB R6, R7, R8"]
  },
  {
    id: "forwarding-compare",
    name: "Forwarding comparison",
    description: "Several RAW dependencies show the difference between baseline and forwarding.",
    lines: ["ADD R1, R2, R3", "ADD R4, R1, R5", "LW R6, 0(R4)", "SUB R7, R6, R8"]
  }
];

const instructionTemplates = [
  { label: "ADD basic", value: "ADD R1, R2, R3" },
  { label: "ADD depends on R1", value: "ADD R3, R1, R5" },
  { label: "ADD independent", value: "ADD R6, R7, R8" },
  { label: "SUB basic", value: "SUB R4, R1, R5" },
  { label: "SUB independent", value: "SUB R6, R7, R8" },
  { label: "LW load-use", value: "LW R1, 10(R2)" },
  { label: "LW zero offset", value: "LW R6, 0(R4)" },
  { label: "LW negative offset", value: "LW R7, -4(R8)" },
  { label: "SW store", value: "SW R1, 0(R2)" },
  { label: "SW offset store", value: "SW R9, 4(R10)" }
];

const state = {
  lines: ["LW R1, 10(R2)", "ADD R3, R1, R5", "SUB R6, R7, R8"],
  kind: "5-stage",
  forwarding: false,
  splitAccess: false,
  editingIndex: null,
  cycle: 0,
  running: false,
  timer: null,
  trace: emptyTrace()
};

const dom = {
  instructionList: document.querySelector("#instructionList"),
  addInstruction: document.querySelector("#addInstruction"),
  examples: document.querySelector("#examples"),
  errors: document.querySelector("#errors"),
  hazards: document.querySelector("#hazards"),
  fourStage: document.querySelector("#fourStage"),
  fiveStage: document.querySelector("#fiveStage"),
  forwarding: document.querySelector("#forwarding"),
  splitAccess: document.querySelector("#splitAccess"),
  step: document.querySelector("#step"),
  runPause: document.querySelector("#runPause"),
  reset: document.querySelector("#reset"),
  cycle: document.querySelector("#cycle"),
  totalCycles: document.querySelector("#totalCycles"),
  instructionCount: document.querySelector("#instructionCount"),
  metricCycles: document.querySelector("#metricCycles"),
  stallCount: document.querySelector("#stallCount"),
  hazardCount: document.querySelector("#hazardCount"),
  stageKey: document.querySelector("#stageKey"),
  pipelineGrid: document.querySelector("#pipelineGrid")
};

function emptyTrace() {
  return { rows: [], hazards: [], totalCycles: 0, stallCount: 0, stages: [] };
}

function stagesFor(kind) {
  return kind === "4-stage" ? ["IF", "ID", "EX", "MEM/WB"] : ["IF", "ID", "EX", "MEM", "WB"];
}

function registerLabel(reg) {
  return `R${reg}`;
}

function parseReg(raw) {
  const reg = Number(raw);
  if (!Number.isInteger(reg) || reg < 0 || reg > 31) {
    throw new Error(`Register out of range: R${raw}. Use R0 through R31.`);
  }
  return reg;
}

function parseInstruction(line, id) {
  const trimmed = line.trim();
  if (!trimmed) throw new Error("Instruction is empty.");

  const alu = trimmed.match(/^(ADD|SUB)\s+R(\d+)\s*,\s*R(\d+)\s*,\s*R(\d+)$/i);
  if (alu) {
    const [, op, rd, rs1, rs2] = alu;
    return {
      id,
      op: op.toUpperCase(),
      rd: parseReg(rd),
      rs1: parseReg(rs1),
      rs2: parseReg(rs2),
      text: `${op.toUpperCase()} R${Number(rd)}, R${Number(rs1)}, R${Number(rs2)}`
    };
  }

  const mem = trimmed.match(/^(LW|SW)\s+R(\d+)\s*,\s*(-?\d+)\s*\(\s*R(\d+)\s*\)$/i);
  if (mem) {
    const [, op, rA, offset, base] = mem;
    const upper = op.toUpperCase();
    const common = {
      id,
      op: upper,
      offset: Number(offset),
      base: parseReg(base),
      text: `${upper} R${Number(rA)}, ${Number(offset)}(R${Number(base)})`
    };
    return upper === "LW" ? { ...common, rd: parseReg(rA) } : { ...common, rs: parseReg(rA) };
  }

  throw new Error(
    `Unsupported syntax: "${line}". Use ADD R1, R2, R3; SUB R1, R2, R3; LW R1, 0(R2); or SW R1, 0(R2).`
  );
}

function parseProgram(lines, editingIndex = null) {
  const nonEmpty = lines.map((line, index) => ({ line, index })).filter((item) => item.line.trim());
  const errors = [];
  const instructions = [];

  if (nonEmpty.length > 10) {
    errors.push(`Too many instructions: ${nonEmpty.length}. The assignment allows at most 10.`);
  }

  nonEmpty.slice(0, 10).forEach(({ line, index }) => {
    try {
      instructions.push(parseInstruction(line, `I${instructions.length + 1}`));
    } catch (error) {
      if (index !== editingIndex) {
        errors.push(`Line ${index + 1}: ${error.message}`);
      }
    }
  });

  return { instructions, errors };
}

function destination(inst) {
  return inst.op === "ADD" || inst.op === "SUB" || inst.op === "LW" ? inst.rd : null;
}

function sources(inst) {
  if (inst.op === "ADD" || inst.op === "SUB") {
    return [
      { reg: inst.rs1, role: "alu" },
      { reg: inst.rs2, role: "alu" }
    ];
  }
  if (inst.op === "LW") {
    return [{ reg: inst.base, role: "address" }];
  }
  return [
    { reg: inst.base, role: "address" },
    { reg: inst.rs, role: "store-data" }
  ];
}

function latestPriorWriter(program, beforeIndex, reg) {
  for (let i = beforeIndex - 1; i >= 0; i -= 1) {
    if (destination(program[i]) === reg) return i;
  }
  return null;
}

function requiredConsumerStart(producerStart, producer, config, sourceRole) {
  if (!config.forwarding) {
    const splitPenalty = config.splitAccess ? 0 : 1;
    return producerStart + (config.kind === "5-stage" ? 3 : 2) + splitPenalty;
  }
  if (sourceRole === "store-data" && producer.op !== "LW") {
    return producerStart + 1;
  }
  return producerStart + (producer.op === "LW" ? 2 : 1);
}

function resolutionFor(producer, config, stalls) {
  if (!config.forwarding) return "STALL_UNTIL_WRITEBACK";
  if (producer.op === "LW" && stalls > 0) return "LOAD_USE_STALL";
  return "FORWARDED";
}

function describeHazard(producer, consumer, reg, stalls, resolution) {
  const source = registerLabel(reg);
  if (resolution === "FORWARDED") {
    return `${consumer.id} reads ${source} from ${producer.id}; forwarding avoids a stall.`;
  }
  if (resolution === "LOAD_USE_STALL") {
    return `${consumer.id} reads loaded ${source} from ${producer.id}; one load-use stall is inserted.`;
  }
  return `${consumer.id} reads ${source} before ${producer.id} writes it; ${stalls} stall${stalls === 1 ? "" : "s"} inserted.`;
}

function scheduleProgram(program, config) {
  const starts = [];
  const hazards = [];

  program.forEach((instruction, index) => {
    let start = index === 0 ? 1 : starts[index - 1] + 1;

    sources(instruction).forEach((source) => {
      const writerIndex = latestPriorWriter(program, index, source.reg);
      if (writerIndex === null) return;

      const producer = program[writerIndex];
      const required = requiredConsumerStart(starts[writerIndex], producer, config, source.role);
      const previousStart = start;
      start = Math.max(start, required);
      const stalls = Math.max(0, required - previousStart);
      const resolution = resolutionFor(producer, config, stalls);

      hazards.push({
        id: `${producer.id}-${instruction.id}-${source.reg}-${source.role}`,
        producerId: producer.id,
        producerText: producer.text,
        consumerId: instruction.id,
        consumerText: instruction.text,
        register: source.reg,
        sourceRole: source.role,
        stalls,
        resolution,
        message: describeHazard(producer, instruction, source.reg, stalls, resolution)
      });
    });

    starts[index] = start;
  });

  return { starts, hazards };
}

function buildTrace(program, config) {
  const stages = stagesFor(config.kind);
  if (program.length === 0) {
    return { ...emptyTrace(), stages };
  }

  const { starts, hazards } = scheduleProgram(program, config);
  const totalCycles = Math.max(...starts.map((start) => start + stages.length - 1));
  const rows = program.map((instruction, index) => {
    const fetchCycle = index === 0 ? starts[index] : starts[index - 1] + 1;
    const startCycle = starts[index];
    const cells = Array.from({ length: totalCycles }, () => "");
    const stallCount = Math.max(0, startCycle - fetchCycle);
    const hasLoadUseStall = hazards.some(
      (hazard) => hazard.consumerId === instruction.id && hazard.resolution === "LOAD_USE_STALL" && hazard.stalls > 0
    );

    cells[fetchCycle - 1] = stages[0];

    if (hasLoadUseStall && stallCount > 0) {
      cells[fetchCycle] = stages[1];
      for (let stall = 0; stall < stallCount; stall += 1) {
        cells[fetchCycle + 1 + stall] = "STALL";
      }
      stages.slice(2).forEach((stage, stageIndex) => {
        cells[fetchCycle + stallCount + 1 + stageIndex] = stage;
      });
    } else {
      for (let stall = 0; stall < stallCount; stall += 1) {
        cells[fetchCycle + stall] = "STALL";
      }
      stages.slice(1).forEach((stage, stageIndex) => {
        cells[startCycle + stageIndex] = stage;
      });
    }

    return { instruction, startCycle, cells };
  });
  const stallCount = rows.reduce((sum, row) => sum + row.cells.filter((cell) => cell === "STALL").length, 0);

  return { rows, hazards, totalCycles, stallCount, stages };
}

function stopRun() {
  if (state.timer) window.clearInterval(state.timer);
  state.timer = null;
  state.running = false;
}

function resetCycle() {
  stopRun();
  state.cycle = 0;
}

function recalculate() {
  const parsed = parseProgram(state.lines, state.editingIndex);
  state.errors = parsed.errors;
  state.instructions = parsed.instructions;
  state.trace = parsed.errors.length === 0 ? buildTrace(parsed.instructions, state) : buildTrace([], state);
  if (state.cycle > state.trace.totalCycles) state.cycle = state.trace.totalCycles;
}

function renderSimulation() {
  recalculate();
  renderErrors();
  renderControls();
  renderSummary();
  renderStageKey();
  renderHazards();
  renderGrid();
}

function renderExamples() {
  dom.examples.innerHTML = "";
  examples.forEach((example) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = example.name;
    button.title = example.description;
    button.addEventListener("click", () => {
      state.lines = [...example.lines];
      resetCycle();
      render();
    });
    dom.examples.appendChild(button);
  });
}

function matchingInstructionTemplates(value) {
  const query = value.trim().toUpperCase();
  if (!query) return instructionTemplates;

  return instructionTemplates.filter((template) => {
    const haystack = `${template.label} ${template.value}`.toUpperCase();
    return haystack.includes(query);
  });
}

function closeInstructionMenus() {
  document.querySelectorAll(".instruction-combo.open").forEach((combo) => combo.classList.remove("open"));
}

function renderInstructionSuggestions(row, index, input) {
  const combo = row.querySelector(".instruction-combo");
  const suggestions = row.querySelector(".instruction-suggestions");
  const matches = matchingInstructionTemplates(input.value).slice(0, 8);
  suggestions.innerHTML = "";

  matches.forEach((template) => {
    const option = document.createElement("button");
    option.type = "button";
    option.setAttribute("role", "option");
    option.innerHTML = `
      <span>${escapeHtml(template.value)}</span>
      <small>${escapeHtml(template.label)}</small>
    `;
    option.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      state.lines[index] = template.value;
      state.editingIndex = null;
      resetCycle();
      render();
    });
    suggestions.appendChild(option);
  });

  const isOpen = document.activeElement === input && matches.length > 0;
  combo.classList.toggle("open", isOpen);
  input.setAttribute("aria-expanded", String(isOpen));
}

function renderInstructions() {
  dom.instructionList.innerHTML = "";
  state.lines.forEach((line, index) => {
    const row = document.createElement("div");
    row.className = "instruction-row";
    row.innerHTML = `
      <label for="instruction-${index}">I${index + 1}</label>
      <div class="instruction-combo">
        <input id="instruction-${index}" autocomplete="off" aria-label="Instruction ${index + 1}" aria-autocomplete="list" aria-expanded="false" value="${escapeHtml(line)}" placeholder="${index === 0 ? "LW R1, 10(R2)" : "ADD R3, R1, R5"}" />
        <span class="combo-arrow" aria-hidden="true">LIST</span>
        <div class="instruction-suggestions" role="listbox" aria-label="Instruction choices for I${index + 1}"></div>
      </div>
      <button class="icon-button" type="button" title="Remove instruction ${index + 1}" aria-label="Remove instruction ${index + 1}">X</button>
    `;

    const input = row.querySelector("input");
    const combo = row.querySelector(".instruction-combo");

    input.addEventListener("focus", () => {
      state.editingIndex = index;
      renderSimulation();
      closeInstructionMenus();
      input.setAttribute("aria-expanded", "true");
      renderInstructionSuggestions(row, index, input);
    });
    input.addEventListener("input", (event) => {
      state.lines[index] = event.target.value;
      resetCycle();
      state.editingIndex = index;
      renderSimulation();
      renderInstructionSuggestions(row, index, input);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        combo.classList.remove("open");
        input.setAttribute("aria-expanded", "false");
      }
      if (event.key === "ArrowDown") {
        renderInstructionSuggestions(row, index, input);
      }
    });
    input.addEventListener("blur", () => {
      try {
        if (state.lines[index].trim()) {
          state.lines[index] = parseInstruction(state.lines[index], `I${index + 1}`).text;
          input.value = state.lines[index];
        }
      } catch (error) {
        // Keep the user's raw text when the instruction is still invalid.
      }
      state.editingIndex = null;
      combo.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
      renderSimulation();
    });
    row.querySelector("button").addEventListener("click", () => {
      if (state.lines.length <= 1) return;
      state.lines.splice(index, 1);
      resetCycle();
      render();
    });
    dom.instructionList.appendChild(row);
  });

  dom.addInstruction.disabled = state.lines.length >= 10;
}

function renderErrors() {
  if (state.editingIndex !== null) {
    dom.errors.classList.remove("hidden");
    dom.errors.innerHTML = `<p>Editing I${state.editingIndex + 1}. Syntax will be checked when you leave this row.</p>`;
    return;
  }
  if (!state.errors || state.errors.length === 0) {
    dom.errors.classList.add("hidden");
    dom.errors.innerHTML = "";
    return;
  }
  dom.errors.classList.remove("hidden");
  dom.errors.innerHTML = state.errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("");
}

function renderControls() {
  dom.fourStage.classList.toggle("active", state.kind === "4-stage");
  dom.fiveStage.classList.toggle("active", state.kind === "5-stage");
  dom.forwarding.checked = state.forwarding;
  dom.splitAccess.checked = state.splitAccess;
  dom.step.disabled = state.trace.totalCycles === 0 || state.cycle >= state.trace.totalCycles;
  dom.runPause.disabled = state.trace.totalCycles === 0;
  dom.runPause.textContent = state.running ? "Pause" : state.cycle >= state.trace.totalCycles && state.trace.totalCycles > 0 ? "Replay" : "Run";
  dom.cycle.textContent = String(state.cycle);
  dom.totalCycles.textContent = String(state.trace.totalCycles);
}

function renderSummary() {
  dom.instructionCount.textContent = String(state.instructions.length);
  dom.metricCycles.textContent = String(state.trace.totalCycles);
  dom.stallCount.textContent = String(state.trace.stallCount);
  dom.hazardCount.textContent = String(state.trace.hazards.length);
}

function renderStageKey() {
  dom.stageKey.innerHTML = state.trace.stages.map((stage) => `<span>${stage}</span>`).join("");
}

function renderHazards() {
  const hazards = state.trace.hazards;
  if (hazards.length === 0) {
    dom.hazards.innerHTML = `<div class="hazard-empty">No RAW dependencies detected for the current program.</div>`;
    return;
  }

  dom.hazards.innerHTML = `
    <ul class="hazard-list">
      ${hazards
        .map(
          (hazard) => `
            <li>
              <strong>${hazard.consumerId} depends on ${hazard.producerId} via ${registerLabel(hazard.register)}</strong>
              <p>${escapeHtml(hazard.message)}</p>
              <span>${hazard.stalls} stall${hazard.stalls === 1 ? "" : "s"} | ${hazard.sourceRole} | ${hazard.resolution.replaceAll("_", " ").toLowerCase()}</span>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

function renderGrid() {
  if (state.trace.rows.length === 0) {
    dom.pipelineGrid.innerHTML = `<div class="hazard-empty">Add at least one valid instruction to build a pipeline trace.</div>`;
    return;
  }

  const firstStallRowByCycle = new Map();
  state.trace.rows.forEach((row, rowIndex) => {
    row.cells.forEach((value, index) => {
      const cycle = index + 1;
      if (value === "STALL" && !firstStallRowByCycle.has(cycle)) {
        firstStallRowByCycle.set(cycle, rowIndex);
      }
    });
  });

  const cycleHeaders = Array.from({ length: state.trace.totalCycles }, (_, index) => `<th>${index + 1}</th>`).join("");
  const rows = state.trace.rows
    .map((row, rowIndex) => {
      const cells = row.cells
        .map((value, index) => {
          const cycle = index + 1;
          const stallRow = firstStallRowByCycle.get(cycle);
          const hiddenBelowStall = stallRow !== undefined && rowIndex > stallRow;
          const displayValue = hiddenBelowStall ? "" : value;
          const classes = [];
          if (cycle === state.cycle) classes.push("current-cycle");
          if (cycle > state.cycle) classes.push("future-cycle");
          if (displayValue === "STALL") classes.push("stall-cell");
          if (displayValue && displayValue !== "STALL") classes.push("stage-cell");
          return `<td class="${classes.join(" ")}">${cycle <= state.cycle ? displayValue : ""}</td>`;
        })
        .join("");

      return `
        <tr>
          <th class="instruction-col"><span class="instruction-badge">${row.instruction.id}</span>${escapeHtml(row.instruction.text)}</th>
          ${cells}
        </tr>
      `;
    })
    .join("");

  dom.pipelineGrid.innerHTML = `
    <table class="pipeline-table" style="min-width: ${248 + state.trace.totalCycles * 84}px;">
      <thead>
        <tr><th class="instruction-col">Instruction</th>${cycleHeaders}</tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function render() {
  recalculate();
  renderInstructions();
  renderErrors();
  renderControls();
  renderSummary();
  renderStageKey();
  renderHazards();
  renderGrid();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

dom.addInstruction.addEventListener("click", () => {
  if (state.lines.length < 10) {
    state.lines.push("");
    resetCycle();
    render();
  }
});

dom.fourStage.addEventListener("click", () => {
  state.kind = "4-stage";
  resetCycle();
  render();
});

dom.fiveStage.addEventListener("click", () => {
  state.kind = "5-stage";
  resetCycle();
  render();
});

dom.forwarding.addEventListener("change", () => {
  state.forwarding = dom.forwarding.checked;
  resetCycle();
  render();
});

dom.splitAccess.addEventListener("change", () => {
  state.splitAccess = dom.splitAccess.checked;
  resetCycle();
  render();
});

dom.step.addEventListener("click", () => {
  state.cycle = Math.min(state.trace.totalCycles, state.cycle + 1);
  render();
});

dom.runPause.addEventListener("click", () => {
  if (state.running) {
    stopRun();
    render();
    return;
  }
  if (state.cycle >= state.trace.totalCycles) state.cycle = 0;
  state.running = true;
  state.timer = window.setInterval(() => {
    if (state.cycle >= state.trace.totalCycles) {
      stopRun();
      render();
      return;
    }
    state.cycle += 1;
    render();
  }, 700);
  render();
});

dom.reset.addEventListener("click", () => {
  resetCycle();
  render();
});

renderExamples();
render();
