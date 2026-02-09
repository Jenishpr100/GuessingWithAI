/* ------------------ ELEMENTS ------------------ */

const statsBtn = document.getElementById("stats-btn"),
      statsPanel = document.getElementById("stats-panel"),
      statsList = document.getElementById("stats-list"),
      closeStats = document.getElementById("close-stats"),
      input = document.getElementById("number-input"),
      submitBtn = document.getElementById("submit-btn"),
      errorMsg = document.getElementById("error-msg"),
      loadingBarContainer = document.querySelector(".loading-bar-container"),
      loadingBar = document.getElementById("loading-bar"),
      openEditorBtn = document.getElementById("open-editor-btn"),
      fakeWindow = document.getElementById("fake-window"),
      windowInputs = document.getElementById("window-inputs"),
      windowOk = document.getElementById("window-ok"),
      resetBtn = document.getElementById("reset-btn");

/* ------------------ DATA ------------------ */

let numberUses = JSON.parse(localStorage.getItem("numberUses")) || {};
for (let i = 1; i <= 10; i++) numberUses[i] ||= 0;

/* ------------------ STATS LIST ------------------ */

function updateStatsList() {
    statsList.innerHTML = "";
    for (let i = 1; i <= 10; i++) {
        const li = document.createElement("li");
        li.textContent = `Number ${i} — used ${numberUses[i]} times`;
        statsList.appendChild(li);
    }
}
updateStatsList();

/* ------------------ PANEL TOGGLE ------------------ */

statsBtn.addEventListener("click", () => statsPanel.classList.toggle("open"));
closeStats.addEventListener("click", () => statsPanel.classList.remove("open"));

/* ------------------ WEIGHTED PREDICTION ------------------ */

function weightedPrediction() {
    const total = Object.values(numberUses).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    let rand = Math.random() * total;

    for (const num in numberUses) {
        if (rand < numberUses[num]) return num;
        rand -= numberUses[num];
    }
}

/* ------------------ SUBMIT ------------------ */

function handleSubmit() {
    const val = parseInt(input.value);
    if (!val || val < 1 || val > 10) {
        errorMsg.textContent = "Enter a number between 1 and 10!";
        return;
    }

    errorMsg.textContent = "";
    loadingBarContainer.style.display = "block";
    loadingBar.style.width = "0%";

    setTimeout(() => loadingBar.style.width = "100%", 50);

    setTimeout(() => {
        numberUses[val]++;
        localStorage.setItem("numberUses", JSON.stringify(numberUses));
        updateStatsList();

        const guess = weightedPrediction();
        if (guess !== null) {
            errorMsg.textContent = `You most likely guessed this number: ${guess}`;
        }

        loadingBarContainer.style.display = "none";
        loadingBar.style.width = "0%";
        input.value = "";
    }, 2000);
}

submitBtn.addEventListener("click", handleSubmit);
input.addEventListener("keypress", e => {
    if (e.key === "Enter") handleSubmit();
// Hyperparameters? I don't actually know what this means.
const INPUT_SIZE = 10;      // one-hot numbers 1-10
const HIDDEN_SIZE = 20;     // hidden units
const OUTPUT_SIZE = 10;     // predicted number 1-10
const LEARNING_RATE = 0.1;

// Sigmoid / tanh / softmax
function sigmoid(x) { return x.map(v => 1 / (1 + Math.exp(-v))); }
function tanh(x) { return x.map(v => Math.tanh(v)); }
function softmax(x) {
    const max = Math.max(...x);
    const exps = x.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => v / sum);
}

// UwU
function zeros(size) { return Array(size).fill(0); }
function randMat(rows, cols) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() * 0.2 - 0.1));
}
function matMul(A, x) {
    return A.map(row => row.reduce((sum, a, i) => sum + a * x[i], 0));
}
function add(a, b) { return a.map((v, i) => v + b[i]); }
function mul(a, b) { return a.map((v, i) => v * b[i]); }

// Warm once, then cool
function oneHot(n) {
    const vec = zeros(INPUT_SIZE);
    vec[n - 1] = 1;
    return vec;
}

// Weights
let LSTM = JSON.parse(localStorage.getItem("LSTM")) || {
    Wxi: randMat(HIDDEN_SIZE, INPUT_SIZE),
    Whi: randMat(HIDDEN_SIZE, HIDDEN_SIZE),
    bi: zeros(HIDDEN_SIZE),

    Wxf: randMat(HIDDEN_SIZE, INPUT_SIZE),
    Whf: randMat(HIDDEN_SIZE, HIDDEN_SIZE),
    bf: zeros(HIDDEN_SIZE),

    Wxo: randMat(HIDDEN_SIZE, INPUT_SIZE),
    Who: randMat(HIDDEN_SIZE, HIDDEN_SIZE),
    bo: zeros(HIDDEN_SIZE),

    Wxg: randMat(HIDDEN_SIZE, INPUT_SIZE),
    Whg: randMat(HIDDEN_SIZE, HIDDEN_SIZE),
    bg: zeros(HIDDEN_SIZE),

    Wy: randMat(OUTPUT_SIZE, HIDDEN_SIZE),
    by: zeros(OUTPUT_SIZE),

    h: zeros(HIDDEN_SIZE),
    c: zeros(HIDDEN_SIZE)
};

// I am so tired.
// I think this is the forward pass now
function lstmForward(x) {
    const i = sigmoid(add(add(matMul(LSTM.Wxi, x), matMul(LSTM.Whi, LSTM.h)), LSTM.bi));
    const f = sigmoid(add(add(matMul(LSTM.Wxf, x), matMul(LSTM.Whf, LSTM.h)), LSTM.bf));
    const o = sigmoid(add(add(matMul(LSTM.Wxo, x), matMul(LSTM.Who, LSTM.h)), LSTM.bo));
    const g = tanh(add(add(matMul(LSTM.Wxg, x), matMul(LSTM.Whg, LSTM.h)), LSTM.bg));

    LSTM.c = add(mul(f, LSTM.c), mul(i, g));
    LSTM.h = mul(o, tanh(LSTM.c));

    const y = softmax(add(matMul(LSTM.Wy, LSTM.h), LSTM.by));
    return y;
}

// Jenish is Gay
function lstmLearn(yPred, target) {
    const targetVec = oneHot(target);
    const error = yPred.map((v, i) => v - targetVec[i]);

    // Update Wy and by using simple gradient descent
    for (let i = 0; i < OUTPUT_SIZE; i++) {
        for (let j = 0; j < HIDDEN_SIZE; j++) {
            LSTM.Wy[i][j] -= LEARNING_RATE * error[i] * LSTM.h[j];
        }
        LSTM.by[i] -= LEARNING_RATE * error[i];
    }

    // UwU
    localStorage.setItem("LSTM", JSON.stringify(LSTM));
}

// Fuck ChatGPT
function predictNextNumber() {
    const y = lstmForward(LSTM.h); // use last hidden as input proxy
    const maxIdx = y.indexOf(Math.max(...y));
    return maxIdx + 1; // numbers 1-10
}

// Use his Gay UI

function handleSubmit() {
    const val = parseInt(input.value);
    if (!val || val < 1 || val > 10) {
        errorMsg.textContent = "Enter 1-10!";
        return;
    }

    errorMsg.textContent = "";
    loadingBarContainer.style.display = "block";
    loadingBar.style.width = "0%";
    setTimeout(() => loadingBar.style.width = "100%", 50);

    setTimeout(() => {
        numberUses[val]++;
        localStorage.setItem("numberUses", JSON.stringify(numberUses));
        updateStatsList();

        // LSTM and Balls 
        const yPred = lstmForward(oneHot(val)); // forward on current input
        lstmLearn(yPred, val);                 // online learning

        const nextPred = predictNextNumber();
        console.log("AI predicts next number:", nextPred);

        loadingBarContainer.style.display = "none";
        loadingBar.style.width = "0%";
        input.value = "";
    }, 2000);
}

// Why'd I let ChatGPT Optimize ts?
