const chamberLibrary = {
  "IBA FC65-G Farmer": {
    ndw: 0.04814,
    kQRev1: [
      [0.56, 1.0004],
      [0.59, 0.9990],
      [0.62, 0.9972],
      [0.65, 0.9946],
      [0.68, 0.9912],
      [0.70, 0.9882],
      [0.72, 0.9846],
      [0.74, 0.9802],
      [0.76, 0.9748],
      [0.78, 0.9683],
      [0.80, 0.9603],
      [0.82, 0.9507]
    ],
    kQFormula: {
      a: 1.09752,
      b: -0.09642
    },
    legacyKq: [
      [0.50, 1.0050],
      [0.53, 1.0040],
      [0.56, 1.0020],
      [0.59, 1.0000],
      [0.62, 0.9980],
      [0.65, 0.9970],
      [0.68, 0.9950],
      [0.70, 0.9920],
      [0.72, 0.9890],
      [0.74, 0.9850],
      [0.76, 0.9810],
      [0.78, 0.9730],
      [0.80, 0.9660],
      [0.82, 0.9580],
      [0.84, 0.9470]
    ],
    legacyKs: [
      [0.50, 1.0000],
      [0.53, 1.0000],
      [0.56, 1.0000],
      [0.59, 1.0000],
      [0.62, 1.0110],
      [0.65, 1.0029],
      [0.68, 1.0029],
      [0.70, 1.0000],
      [0.72, 1.0042],
      [0.74, 1.0042],
      [0.76, 1.0071],
      [0.78, 1.0071],
      [0.80, 1.0000],
      [0.82, 1.0000],
      [0.84, 1.0000]
    ]
  }
};

const linacLibrary = {
  "Linac 1": { "6": 0.671, "10": 0.739, "6FFF": 0.632, "10FFF": 0.707 },
  "Linac 2": { "6": 0.671, "10": 0.739, "6FFF": 0.632, "10FFF": 0.707 },
  "Linac 4": { "6": 0.671, "10": 0.739, "15": 0.763, "6FFF": 0.632 },
  "Linac 5": { "6": 0.671, "10": 0.739, "15": 0.763, "6FFF": 0.632 }
};

const pressureUnits = {
  mBar: 1013,
  mmHg: 760,
  kPa: 101.3,
  atm: 1
};

const ksCoefficients = {
  pulsed: {
    2.0: [2.337, -3.636, 2.299],
    2.5: [1.474, -1.587, 1.114],
    3.0: [1.198, -0.875, 0.677],
    3.5: [1.08, -0.542, 0.463],
    4.0: [1.022, -0.363, 0.341],
    5.0: [0.975, -0.188, 0.214]
  },
  "pulsed-scanned": {
    2.0: [4.711, -8.242, 4.533],
    2.5: [2.719, -3.977, 2.261],
    3.0: [2.001, -2.402, 1.404],
    3.5: [1.665, -1.647, 0.984],
    4.0: [1.468, -1.2, 0.734],
    5.0: [1.279, -0.75, 0.474]
  }
};

const initialState = {
  chamber: "IBA FC65-G Farmer",
  ndw: 0.04814,
  linac: "",
  energy: "",
  tpr: "",
  mu: "",
  reading: "",
  temperature: "",
  pressure: "",
  pressureUnit: "mBar",
  referenceTemperature: 20,
  kqMode: "formula",
  kelec: 1,
  kpol: 1,
  recombinationMode: "legacy",
  beamType: "pulsed",
  v1: 300,
  v2: 150,
  m1: "",
  m2: ""
};

const state = loadState();

const ids = [
  "chamber",
  "ndw",
  "linac",
  "energy",
  "tpr",
  "referencePressure",
  "mu",
  "reading",
  "temperature",
  "pressure",
  "pressureUnit",
  "referenceTemperature",
  "kqMode",
  "kelec",
  "kpol",
  "recombinationMode",
  "beamType",
  "v1",
  "v2",
  "m1",
  "m2"
];

const elements = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const results = {
  ktp: document.getElementById("resultKtp"),
  kq: document.getElementById("resultKq"),
  ks: document.getElementById("resultKs"),
  mq: document.getElementById("resultMq"),
  dw: document.getElementById("resultDw"),
  dosePer100: document.getElementById("resultDosePer100"),
  status: document.getElementById("status"),
  trs398Fields: document.getElementById("trs398Fields"),
  legacyFields: document.getElementById("legacyFields")
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("absolute-dose-state") || "{}");
    const nextState = { ...initialState, ...saved };
    nextState.linac = "";
    nextState.energy = "";
    nextState.tpr = "";
    nextState.mu = "";
    nextState.reading = "";
    nextState.temperature = "";
    nextState.pressure = "";
    nextState.m1 = "";
    nextState.m2 = "";
    return nextState;
  } catch {
    return { ...initialState };
  }
}

function saveState() {
  localStorage.setItem("absolute-dose-state", JSON.stringify(state));
}

function populateSelect(select, options) {
  select.innerHTML = "";
  options.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function bindLibraries() {
  populateSelect(elements.chamber, Object.keys(chamberLibrary));
  populateSelect(elements.linac, ["", ...Object.keys(linacLibrary)]);
  populateSelect(elements.pressureUnit, Object.keys(pressureUnits));
  refreshEnergyOptions();
}

function refreshEnergyOptions() {
  const energies = state.linac ? Object.keys(linacLibrary[state.linac]) : [];
  populateSelect(elements.energy, ["", ...energies]);
  if (!state.linac) {
    state.energy = "";
    state.tpr = "";
    return;
  }
  if (!energies.includes(state.energy)) {
    state.energy = "";
  }
}

function interpolate(points, x) {
  if (points.length < 2) {
    throw new Error("At least two points are required for interpolation.");
  }
  if (x < points[0][0] || x > points[points.length - 1][0]) {
    throw new Error(`Value ${x} is outside the supported range ${points[0][0]} to ${points[points.length - 1][0]}.`);
  }
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[index + 1];
    if (x === x1) {
      return y1;
    }
    if (x >= x1 && x <= x2) {
      const ratio = (x - x1) / (x2 - x1);
      return y1 + ratio * (y2 - y1);
    }
  }
  return points[points.length - 1][1];
}

function calculateKtp() {
  if (state.temperature === "" || state.pressure === "") {
    throw new Error("Enter temperature and pressure to calculate the result.");
  }
  const pRef = pressureUnits[state.pressureUnit];
  return ((273.2 + state.temperature) / (273.2 + state.referenceTemperature)) * (pRef / state.pressure);
}

function calculateKs() {
  if (state.recombinationMode === "legacy") {
    if (state.tpr === "") {
      throw new Error("Select linac and energy to determine TPR20/10.");
    }
    return interpolate(chamberLibrary[state.chamber].legacyKs, state.tpr);
  }

  if (state.v1 === "" || state.v2 === "" || state.m1 === "" || state.m2 === "") {
    throw new Error("Enter the two-voltage readings to calculate kS.");
  }

  const voltageRatio = state.v1 / state.v2;
  const key = Number(voltageRatio.toFixed(1));
  const coefficients = ksCoefficients[state.beamType][key];
  if (!coefficients) {
    throw new Error("Supported V1/V2 ratios for the two-voltage method are 2.0, 2.5, 3.0, 3.5, 4.0, and 5.0.");
  }

  if (state.m2 === 0) {
    throw new Error("M2 cannot be zero.");
  }

  const ratio = state.m1 / state.m2;
  const [a0, a1, a2] = coefficients;
  return a0 + a1 * ratio + a2 * ratio * ratio;
}

function calculateKq() {
  if (state.tpr === "") {
    throw new Error("Select linac and energy to determine TPR20/10.");
  }
  if (state.kqMode === "legacy") {
    return interpolate(chamberLibrary[state.chamber].legacyKq, state.tpr);
  }

  const { a, b } = chamberLibrary[state.chamber].kQFormula;
  return (1 + Math.exp((a - 0.57) / b)) / (1 + Math.exp((a - state.tpr) / b));
}

function syncModelToInputs() {
  Object.entries(state).forEach(([key, value]) => {
    if (elements[key]) {
      elements[key].value = value === "" ? "" : String(value);
    }
  });
  elements.referencePressure.value = `${pressureUnits[state.pressureUnit]} ${state.pressureUnit}`;
}

function parseNumericInput(value) {
  return value === "" ? "" : Number(value);
}

function syncInputsToModel(event) {
  const { id, value } = event.target;
  const numericFields = new Set([
    "ndw",
    "tpr",
    "mu",
    "reading",
    "temperature",
    "pressure",
    "referenceTemperature",
    "kelec",
    "kpol",
    "v1",
    "v2",
    "m1",
    "m2"
  ]);

  state[id] = numericFields.has(id) ? parseNumericInput(value) : value;

  if (id === "chamber") {
    state.ndw = chamberLibrary[state.chamber].ndw;
  }

  if (id === "linac") {
    refreshEnergyOptions();
    state.tpr = state.energy ? linacLibrary[state.linac][state.energy] : "";
  }

  if (id === "energy") {
    state.tpr = state.energy ? linacLibrary[state.linac][state.energy] : "";
  }

  if (id === "reading") {
    state.m1 = state.reading;
  }

  syncModelToInputs();
  saveState();
  render();
}

function formatNumber(value, digits = 6) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function render() {
  results.trs398Fields.classList.toggle("hidden", state.recombinationMode !== "trs398");
  results.legacyFields.classList.toggle("hidden", state.recombinationMode !== "legacy");

  try {
    if (!state.linac || !state.energy || state.mu === "" || state.reading === "") {
      throw new Error("Select linac and energy, then enter MU and reading to calculate the result.");
    }

    const ktp = calculateKtp();
    const ks = calculateKs();
    const kq = calculateKq();
    const mq = state.reading * ktp * state.kelec * state.kpol * ks;
    const dw = mq * state.ndw * kq;
    const dosePer100 = state.mu === 0 ? NaN : (dw / state.mu) * 100;

    results.ktp.textContent = formatNumber(ktp);
    results.ks.textContent = formatNumber(ks);
    results.kq.textContent = formatNumber(kq);
    results.mq.textContent = formatNumber(mq);
    results.dw.textContent = formatNumber(dw);
    results.dosePer100.textContent = formatNumber(dosePer100);

    if (state.recombinationMode === "legacy") {
      results.status.textContent = "Legacy mode matches the spreadsheet shortcut for kS.";
      results.status.style.color = "var(--warn)";
    } else {
      results.status.textContent = "TRS-398 mode uses the official two-voltage method coefficients.";
      results.status.style.color = "var(--ok)";
    }
  } catch (error) {
    results.ktp.textContent = "—";
    results.ks.textContent = "—";
    results.kq.textContent = "—";
    results.mq.textContent = "—";
    results.dw.textContent = "—";
    results.dosePer100.textContent = "—";
    results.status.textContent = error.message;
    results.status.style.color = "var(--warn)";
  }
}

bindLibraries();
syncModelToInputs();
ids.forEach((id) => elements[id].addEventListener("input", syncInputsToModel));
render();
