/* ===========================================================
   AI ASSISTANT
   =========================================================== */
async function sendAI() {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;

  document.getElementById("response").innerHTML = "⏳ Sedang memproses...";

  try {
    const r = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const d = await r.json();
    document.getElementById("response").innerText = d.reply || "Tidak ada balasan.";
  } catch (e) {
    document.getElementById("response").innerText =
      "⚠ Error: " + e.message;
  }
}

/* ===========================================================
   GOOGLE SEARCH
   =========================================================== */
function goGoogle() {
  const q = document.getElementById("gSearch").value.trim();
  if (!q) return;

  window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank");
}

/* ===========================================================
   INSTAGRAM VIEWER
   =========================================================== */
function openIG() {
  const user = document.getElementById("igUser").value.trim();
  if (!user) {
    window.open("https://www.instagram.com", "_blank");
    return;
  }
  window.open("https://www.instagram.com/" + user, "_blank");
}

/* ===========================================================
   FACEBOOK VIEWER
   =========================================================== */
function openFB() {
  const page = document.getElementById("fbPage").value.trim();
  if (!page) {
    window.open("https://m.facebook.com", "_blank");
    return;
  }
  window.open("https://m.facebook.com/search/?query=" + encodeURIComponent(page), "_blank");
}

/* ===========================================================
   TIKTOK VIEWER
   =========================================================== */
function goTikTok() {
  const q = document.getElementById("ttSearch").value.trim();
  const url = "https://www.tiktok.com/search?q=" + encodeURIComponent(q || "viral");
  window.open(url, "_blank");
}

/* ===========================================================
   YOUTUBE PLAYER + SEARCH
   =========================================================== */
const defaultVideos = [
  "dQw4w9WgXcQ",
  "3JZ_D3ELwOQ",
  "fJ9rUzIMcZQ",
  "kXYiU_JCYtU",
  "9bZkp7q19f0"
];

function loadVideo(id) {
  document.getElementById("ytPlayer").src = 
    "https://www.youtube.com/embed/" + id + "?rel=0&modestbranding=1";
}

function randomVideo() {
  const id = defaultVideos[Math.floor(Math.random() * defaultVideos.length)];
  loadVideo(id);
}

function searchYouTube() {
  const q = document.getElementById("ytSearch").value.trim();
  if (!q) return randomVideo();

  if (q.length === 11) {
    loadVideo(q);
    return;
  }

  window.open("https://www.youtube.com/results?search_query=" + encodeURIComponent(q), "_blank");
}

setTimeout(randomVideo, 800);

/* ===========================================================
   QUOTE
   =========================================================== */
function loadQuote() {
  fetch("/api/quote")
    .then(r => r.json())
    .then(d => (document.getElementById("quoteArea").innerText = d.quote))
    .catch(() => (document.getElementById("quoteArea").innerText = "Gagal memuat quote"));
}
loadQuote();

/* ===========================================================
   CUACA
   =========================================================== */
function loadWeather() {
  if (!navigator.geolocation) {
    document.getElementById("weatherArea").innerText = "GPS tidak didukung.";
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`https://wttr.in/${latitude},${longitude}?format=3`)
      .then(r => r.text())
      .then(t => (document.getElementById("weatherArea").innerText = t))
      .catch(() => (document.getElementById("weatherArea").innerText = "Gagal memuat cuaca."));
  });
}
loadWeather();

/* ===========================================================
   GAME OPEN
   =========================================================== */
function playGame(name) {
  window.open(name + ".html", "_blank");
}

/* REGISTER */
window.sendAI = sendAI;
window.goGoogle = goGoogle;
window.openIG = openIG;
window.openFB = openFB;
window.goTikTok = goTikTok;
window.randomVideo = randomVideo;
window.searchYouTube = searchYouTube;
window.playGame = playGame;
