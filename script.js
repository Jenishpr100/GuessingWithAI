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

/* ------------------ SUBMIT ------------------ */

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


        loadingBarContainer.style.display = "none";
        loadingBar.style.width = "0%";
        input.value = "";
    }, 2000);
}

submitBtn.addEventListener("click", handleSubmit);
input.addEventListener("keypress", e => {
    if (e.key === "Enter") handleSubmit();
});





/* ------------------ RESET ------------------ */

resetBtn.addEventListener("click", () => {
    for (let i = 1; i <= 10; i++) numberUses[i] = 0;
    localStorage.setItem("numberUses", JSON.stringify(numberUses));
    updateStatsList();

});

/* ------------------ POPUP ------------------ */

function openFakeWindow() {
    windowInputs.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
        const div = document.createElement("div");
        div.innerHTML = `
            Number ${i}:
            <input type="number" min="0" value="${numberUses[i]}" data-num="${i}">
        `;
        windowInputs.appendChild(div);
    }

    fakeWindow.style.display = "block";
}

openEditorBtn.addEventListener("click", openFakeWindow);

windowOk.addEventListener("click", () => {
    windowInputs.querySelectorAll("input").forEach(input => {
        const num = input.dataset.num;
        numberUses[num] = parseInt(input.value) || 0;
    });

    localStorage.setItem("numberUses", JSON.stringify(numberUses));
    updateStatsList();
    fakeWindow.style.display = "none";
});

/* click outside popup */
fakeWindow.addEventListener("click", e => {
    if (e.target === fakeWindow) fakeWindow.style.display = "none";
});

/* ESC close */
document.addEventListener("keydown", e => {
    if (e.key === "Escape") fakeWindow.style.display = "none";
});
