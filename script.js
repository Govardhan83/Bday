let currentScreen = "screen-shooting";
let score = 0;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  currentScreen = id;
}

// Shooting game
const targetArea = document.getElementById("target-area");
function spawnHeart() {
  let heart = document.createElement("div");
  heart.classList.add("heart");
  heart.style.top = Math.random() * 250 + "px";
  heart.style.left = Math.random() * 250 + "px";
  heart.onclick = () => {
    heart.remove();
    score++;
    document.getElementById("score").innerText = "Score: " + score;
    if (score >= 5) showScreen("screen-note");
  };
  targetArea.appendChild(heart);
  setTimeout(() => heart.remove(), 2000);
}
setInterval(spawnHeart, 1500);

// Path choice
function goToChoice() {
  showScreen("screen-choice");
}
function goTo(path) {
  if (path === "quiz") showScreen("screen-quiz");
  if (path === "cake") showScreen("screen-cake");
}

// Quiz
document.getElementById("quizForm").onsubmit = (e) => {
  e.preventDefault();
  showScreen("screen-maze");
};

// Maze
let tries = 3;
document.addEventListener("keydown", (e) => {
  if (currentScreen !== "screen-maze") return;
  const player = document.getElementById("player");
  let top = parseInt(player.style.top);
  let left = parseInt(player.style.left);
  if (e.key === "ArrowUp") top -= 10;
  if (e.key === "ArrowDown") top += 10;
  if (e.key === "ArrowLeft") left -= 10;
  if (e.key === "ArrowRight") left += 10;
  player.style.top = top + "px";
  player.style.left = left + "px";
  if (top > 270 || left > 270) {
    tries--;
    document.getElementById("tries").innerText = tries;
    player.style.top = "10px";
    player.style.left = "10px";
    if (tries <= 0) {
      alert("Govu can't ever escape from your heart ❤️");
      showScreen("screen-video");
    }
  }
});
