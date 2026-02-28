// ===============================
// STUDOO MAIN SCRIPT (FIXED)
// ===============================

// ===== MODES =====
const MODES = {
  focus: 25,
  short: 5,
  long: 15,
  deep: 50,
  micro: 5
};

let currentMode = "focus";
let minutes = MODES[currentMode];
let seconds = 0;
let interval = null;
let isRunning = false;
let sessionsCompleted = 0;


// ===== LOGIN =====
const loginScreen = document.getElementById("login-screen");
const appRoot = document.getElementById("app-root");
const loginNameInput = document.getElementById("login-name");
const loginBtn = document.getElementById("login-btn");

let myName = localStorage.getItem("userName") || "You";

if (loginBtn) {
  loginBtn.addEventListener("click", () => {

    const name =
      loginNameInput.value.trim() || "You";

    myName = name;

    localStorage.setItem("userName", name);

    loginScreen.style.display = "none";
    appRoot.style.display = "block";

  });
}

window.addEventListener("load", () => {

  const existing =
    localStorage.getItem("userName");

  if (existing) {

    myName = existing;

    loginScreen.style.display = "none";
    appRoot.style.display = "block";

  }

});


// ===== DOM =====
const timeDisplay = document.getElementById("time");

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

const modeButtons =
  document.querySelectorAll(".mode-btn");

const sessionDotsContainer =
  document.getElementById("session-dots");


// ===== HABIT SYSTEM =====
let xp = 0;
let dayStreak = 1;
let sessionsToday = 0;

const xpSpan =
  document.getElementById("xp-value");

const streakSpan =
  document.getElementById("streak-value");

const sessionsTodaySpan =
  document.getElementById("sessions-today");


function updateHabitUI() {

  if (xpSpan)
    xpSpan.textContent = xp;

  if (streakSpan)
    streakSpan.textContent = dayStreak;

  if (sessionsTodaySpan)
    sessionsTodaySpan.textContent = sessionsToday;

}


function saveHabitData() {

  const today =
    new Date().toDateString();

  localStorage.setItem(
    "habitData",

    JSON.stringify({
      xp,
      dayStreak,
      sessionsToday,
      lastDate: today
    })

  );

}


function loadHabitData() {

  const saved =
    JSON.parse(
      localStorage.getItem("habitData") || "{}"
    );

  const today =
    new Date().toDateString();

  if (saved.lastDate === today) {

    xp = saved.xp || 0;
    dayStreak = saved.dayStreak || 1;
    sessionsToday = saved.sessionsToday || 0;

  }
  else {

    dayStreak = (saved.dayStreak || 0) + 1;

    xp = saved.xp || 0;

    sessionsToday = 0;

  }

}


// ===== SESSION LOGGING =====
function logSession() {

  const logs =
    JSON.parse(
      localStorage.getItem("sessionLogs") || "[]"
    );

  logs.push({

    time:
      new Date().toLocaleString(),

    mode:
      currentMode,

    duration:
      MODES[currentMode]

  });

  localStorage.setItem(
    "sessionLogs",

    JSON.stringify(logs.slice(-20))

  );

  renderSessionLogs();

}


const sessionLogList =
  document.getElementById("session-log-list");


function renderSessionLogs() {

  if (!sessionLogList) return;

  const logs =
    JSON.parse(
      localStorage.getItem("sessionLogs") || "[]"
    ).slice(-5).reverse();


  sessionLogList.innerHTML = "";

  logs.forEach(log => {

    const li =
      document.createElement("li");

    li.textContent =
      `${log.time.split(",")[0]} — ${log.mode}`;

    sessionLogList.appendChild(li);

  });

}


// ===== SESSION COMPLETE =====
function handleSessionComplete() {

  if (
    currentMode === "focus" ||
    currentMode === "deep"
  ) {

    xp += 10;

    sessionsToday++;

  }
  else {

    xp += 4;

    if (typeof confetti !== "undefined") {

      confetti({
        particleCount: 150,
        spread: 70
      });

    }

  }

  logSession();

  updateHabitUI();

  saveHabitData();

  alert("Session complete 🎉");

}


// ===== TIMER =====
function formatTime(m, s) {

  return (
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0")
  );


}
let timeLeft = 25 * 60;
let timerInterval = null;

function updateDisplay()
{
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  document.getElementById("time").textContent =
    `${minutes}:${seconds.toString().padStart(2,"0")}`;
}

function startTimer()
{
  if(timerInterval) return;

  timerInterval = setInterval(() =>
  {
    if(timeLeft > 0)
    {
      timeLeft--;
      updateDisplay();
    }
    else
    {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
}


function tick() {

  if (seconds === 0) {

    if (minutes === 0) {

      clearInterval(interval);

      isRunning = false;

      sessionsCompleted++;

      renderSessionDots();

      handleSessionComplete();

      return;

    }

    minutes--;

    seconds = 59;

  }
  else {

    seconds--;

  }

  timeDisplay.textContent =
    formatTime(minutes, seconds);

}
const microBtn = document.getElementById("micro-session-btn");

microBtn.addEventListener("click", () =>
{
  // set 5 minutes
  timeLeft = 5 * 60;

  // update display immediately
  updateDisplay();

  // start timer automatically
  startTimer();
});

// ===== BUTTONS =====
startBtn.onclick = () => {

  if (!isRunning) {

    isRunning = true;

    interval =
      setInterval(tick, 1000);

  }

};


pauseBtn.onclick = () => {

  clearInterval(interval);

  isRunning = false;

};


resetBtn.onclick = () => {

  clearInterval(interval);

  isRunning = false;

  minutes = MODES[currentMode];

  seconds = 0;

  timeDisplay.textContent =
    formatTime(minutes, seconds);

};


// ===== MODE SWITCH =====
modeButtons.forEach(btn => {

  btn.onclick = () => {

    currentMode =
      btn.dataset.mode;

    resetBtn.click();

    modeButtons.forEach(b =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

  };

});


// ===== SESSION DOTS =====
function renderSessionDots() {

  sessionDotsContainer.innerHTML = "";

  for (let i = 0; i < 4; i++) {

    const dot =
      document.createElement("div");

    dot.className =
      "session-dot";

    if (i < sessionsCompleted)
      dot.classList.add("active");

    sessionDotsContainer.appendChild(dot);

  }

}


// ===== TASK SYSTEM =====
const taskInput =
  document.getElementById("task-input");

const addTaskBtn =
  document.getElementById("add-task");

const taskList =
  document.getElementById("task-list");

let tasks =
  JSON.parse(
    localStorage.getItem("tasks") || "[]"
  );


function saveTasks() {

  localStorage.setItem(
    "tasks",
    JSON.stringify(tasks)
  );

}


function renderTasks() {

  if (!taskList) return;

  taskList.innerHTML = "";

  tasks.forEach(task => {

    const li =
      document.createElement("li");

    li.textContent =
      task.text;

    taskList.appendChild(li);

  });

}


addTaskBtn.onclick = () => {

  const text =
    taskInput.value.trim();

  if (!text) return;

  tasks.push({ text });

  saveTasks();

  renderTasks();

  taskInput.value = "";

};
async function askAI() {

  const input = document.getElementById("ai-input");

  const chat = document.getElementById("ai-chat-window");

  const message = input.value.trim();

  if (!message) return;

  // show your message
  appendAiMessage(message, "user");

  input.value = "";

  // show thinking
  appendAiMessage("Thinking...", "bot");

  try {

    const response = await fetch(
      "http://localhost:3000/chat",   // ← this connects to your server
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: message
        })
      }
    );

    const data = await response.json();

    // replace "Thinking..." with real answer
    chat.lastChild.textContent = data.reply;

  }
  catch {

    chat.lastChild.textContent =
      "Error: AI server not running.";

  }

}
function appendAiMessage(text, sender)
{
  const chat =
    document.getElementById("ai-chat-window");

  const msg =
    document.createElement("div");

  msg.className =
    "ai-message " + sender;

  msg.textContent = text;

  chat.appendChild(msg);

  chat.scrollTop =
    chat.scrollHeight;
}



async function askAI()
{
  const input =
    document.getElementById("ai-input");

  const message =
    input.value.trim();

  if(!message) return;

  appendAiMessage(message, "user");

  input.value = "";

  appendAiMessage("Thinking...", "bot");

  try
  {
    const response =
      await fetch(
        "http://localhost:3000/chat",
        {
          method: "POST",

          headers:
          {
            "Content-Type":
            "application/json"
          },

          body: JSON.stringify({
            message: message
          })
        }
      );

    const data =
      await response.json();

    const chat =
      document.getElementById("ai-chat-window");

    chat.lastChild.textContent =
      data.reply;
  }

  catch
  {
    document
      .getElementById("ai-chat-window")
      .lastChild.textContent =
      "Error connecting to AI server";
  }
}

const player =
document.getElementById("spotify-player");

const playlists =
{
  lofi:
  "https://open.spotify.com/embed/playlist/37i9dQZF1DX8NTLI2TtZa6",

  deep:
  "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",

  jazz:
  "https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt"
};

document.getElementById("music-select").onchange =
(e) =>
{
  player.src = playlists[e.target.value];
};

// default
player.src = playlists.lofi;

// ===== INIT =====
timeDisplay.textContent =
  formatTime(minutes, seconds);

loadHabitData();

updateHabitUI();

renderSessionDots();

renderSessionLogs();

renderTasks();