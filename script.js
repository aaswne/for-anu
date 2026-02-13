const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Theme (Dark Mode) ---------- */
const modeToggle = $("#modeToggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  modeToggle.setAttribute("aria-pressed", "true");
  modeToggle.querySelector(".toggle__icon").textContent = "☀️";
  modeToggle.querySelector(".toggle__text").textContent = "Light";
}

modeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    modeToggle.setAttribute("aria-pressed", "false");
    modeToggle.querySelector(".toggle__icon").textContent = "🌙";
    modeToggle.querySelector(".toggle__text").textContent = "Dark";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    modeToggle.setAttribute("aria-pressed", "true");
    modeToggle.querySelector(".toggle__icon").textContent = "☀️";
    modeToggle.querySelector(".toggle__text").textContent = "Light";
  }
});

/* ---------- Countdown to Feb 14 (next if past) ---------- */
const countdownEl = $("#countdown");

function nextValentineDate() {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, 1, 14, 0, 0, 0, 0);
  if (now > target) target = new Date(year + 1, 1, 14, 0, 0, 0, 0);
  return target;
}

function formatDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}h ${pad(m)}m ${pad(ss)}s`;
}

function tickCountdown() {
  const target = nextValentineDate();
  const now = new Date();
  countdownEl.textContent = formatDuration(target - now);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ---------- NO button prank ---------- */
const card = $("#valentineCard");
const btnRow = $("#btnRow");
const noBtn = $("#noBtn");
const yesBtn = $("#yesBtn");
const prankLine = $("#prankLine");
const cry = $("#cryEmojis");

let attempt = 0;
const messages = [
  "Are you sure? 😭",
  "Anuu please 🥺",
  "Don’t break my heart 💔",
  "Okay… maybe YES? 👉👈",
  "Try again 😭",
  "Wait wait wait 😅",
  "I’m watching you 👀",
  "NO is not an option 😌",
  "Be kind to me 🫶",
  "One more time… 😭"
];

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function moveNoButton() {
  attempt += 1;

  prankLine.textContent = messages[(attempt - 1) % messages.length];
  cry.textContent = "😭".repeat(clamp(attempt, 1, 12));

  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");

  const rowRect = btnRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const padding = 6;

  const maxLeft = rowRect.width - btnRect.width - padding;
  const maxTop  = rowRect.height - btnRect.height - padding;

  const left = Math.random() * maxLeft;
  const top  = Math.random() * maxTop;

  noBtn.style.left = `${clamp(left, padding, maxLeft)}px`;
  noBtn.style.top  = `${clamp(top, padding, maxTop)}px`;
}

function initNoPosition() {
  const rowRect = btnRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const padding = 6;

  const left = rowRect.width - btnRect.width - padding;
  noBtn.style.left = `${Math.max(padding, left)}px`;
  noBtn.style.top = `${padding}px`;
}

["pointerdown", "pointerenter"].forEach(evt => {
  noBtn.addEventListener(evt, (e) => {
    e.preventDefault();
    moveNoButton();
  }, { passive: false });
});
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoButton();
});

/* ---------- YES flow: confetti + scroll ---------- */
const confetti = $("#confetti");

function burstHearts() {
  const count = 18;
  const centerX = window.innerWidth / 2;

  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "heart";

    const x = centerX + (Math.random() * 200 - 100);
    const y = 90 + Math.random() * 40;

    h.style.left = `${x}px`;
    h.style.top = `${y}px`;

    const size = 8 + Math.random() * 8;
    h.style.width = `${size}px`;
    h.style.height = `${size}px`;

    confetti.appendChild(h);
    setTimeout(() => h.remove(), 1000);
  }
}

yesBtn.addEventListener("click", () => {
  burstHearts();
  prankLine.textContent = "Best choice ever 💖";
  cry.textContent = "";
  $("#message").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ---------- Spotify reveal (manual + auto on Photos enter) ---------- */
const spotifyReveal = $("#spotifyReveal");
const spotifyWrap = $("#spotifyWrap");

function revealSpotify() {
  if (!spotifyWrap.hidden) return;
  spotifyWrap.hidden = false;
  spotifyReveal.disabled = true;
  spotifyReveal.textContent = "Song ready 🎶";
}

spotifyReveal.addEventListener("click", revealSpotify);

/* Auto reveal when Photos section enters viewport */
const photosSection = $("#photos");
const photosEnterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    revealSpotify(); // cannot force autoplay, but player becomes visible automatically
    photosEnterObserver.disconnect();
  });
}, { threshold: 0.18 });

photosEnterObserver.observe(photosSection);

/* ---------- Photos: reveal animation + Lightbox ---------- */
const photoGrid = $("#photoGrid");
const lightbox = $("#lightbox");
const lbImg = $("#lbImg");
const lbBackdrop = $("#lbBackdrop");
const lbClose = $("#lbClose");

function openLightboxFromImg(imgEl) {
  const src = imgEl.currentSrc || imgEl.src; // must use already-loaded URL
  lbImg.src = src;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lbClose.focus({ preventScroll: true });
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lbImg.src = "";
}

photoGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".ph");
  if (!btn) return;
  const img = $("img", btn);
  if (!img) return;
  openLightboxFromImg(img);
});

lbBackdrop.addEventListener("click", closeLightbox);
lbClose.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (lightbox.classList.contains("is-open")) closeLightbox();
    if ($("#videobox").classList.contains("is-open")) closeVideo();
  }
});

/* Fade-in on entering grid */
const gridObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const items = $$(".ph", photoGrid);
    items.forEach((el, idx) => setTimeout(() => el.classList.add("reveal"), idx * 60));
    gridObserver.disconnect();
  });
}, { threshold: 0.18 });

gridObserver.observe(photoGrid);

/* ---------- VIDEO MODAL ---------- */
const videobox = $("#videobox");
const vbBackdrop = $("#vbBackdrop");
const vbClose = $("#vbClose");
const vbGoBack = $("#vbGoBack");
const vbPlay = $("#vbPlay");
const vbPause = $("#vbPause");
const ourVideo = $("#ourVideo");
const openVideoBtn = $("#openVideoBtn");

function openVideo() {
  videobox.classList.add("is-open");
  videobox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  // Don’t autoplay without user gesture—BUT the button click IS a gesture, so play is allowed:
  ourVideo.currentTime = 0;
  ourVideo.play().catch(() => {
    // If blocked, user can tap Play
  });
}

function closeVideo() {
  videobox.classList.remove("is-open");
  videobox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  ourVideo.pause();
}

openVideoBtn.addEventListener("click", openVideo);
vbBackdrop.addEventListener("click", closeVideo);
vbClose.addEventListener("click", closeVideo);

vbGoBack.addEventListener("click", () => {
  closeVideo();
  $("#message").scrollIntoView({ behavior: "smooth", block: "start" });
});

vbPlay.addEventListener("click", () => {
  ourVideo.play().catch(() => {});
});

vbPause.addEventListener("click", () => {
  ourVideo.pause();
});

/* ---------- Init positions ---------- */
window.addEventListener("load", initNoPosition);
window.addEventListener("resize", initNoPosition);


/* ===== Roaming Heart: moves around page, dodges hover, flies out + returns with flowers ===== */
const roamHeart = document.getElementById("roamHeart");
const flowerEmojis = ["🌸","💐","🌷","🌹","🌼"];

function rand(min, max){ return Math.random() * (max - min) + min; }
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function spawnFlower(x, y){
  const f = document.createElement("div");
  f.className = "flowerTrail";
  f.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
  f.style.left = `${x}px`;
  f.style.top = `${y}px`;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 750);
}

let pos = { x: 40, y: 140 };
let vel = { x: 1.1, y: 0.9 };
let target = null;               // mouse/touch pointer
let lastDodge = 0;

function viewportBounds(){
  const w = window.innerWidth;
  const h = window.innerHeight;
  const size = roamHeart ? roamHeart.getBoundingClientRect() : { width: 62, height: 62 };
  const pad = 10;
  return {
    minX: pad,
    minY: pad + 60,              // keep away from very top a bit (topbar)
    maxX: w - size.width - pad,
    maxY: h - size.height - pad
  };
}

function placeHeart(){
  const b = viewportBounds();
  pos.x = clamp(pos.x, b.minX, b.maxX);
  pos.y = clamp(pos.y, b.minY, b.maxY);
  roamHeart.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
}

function pickNewVel(){
  // gentle wander speed (works on mobile too)
  vel.x = rand(-1.6, 1.6);
  vel.y = rand(-1.2, 1.2);

  // avoid too-slow movement
  if (Math.abs(vel.x) < 0.6) vel.x = 0.9 * Math.sign(vel.x || 1);
  if (Math.abs(vel.y) < 0.5) vel.y = 0.8 * Math.sign(vel.y || 1);
}

function dodgeFromPointer(){
  if (!target) return;
  const now = performance.now();
  if (now - lastDodge < 90) return; // throttle
  lastDodge = now;

  const rect = roamHeart.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const dx = cx - target.x;
  const dy = cy - target.y;
  const dist = Math.hypot(dx, dy);

  // If pointer comes close, jump away strongly
  if (dist < 140) {
    const b = viewportBounds();
    const awayX = dx / (dist || 1);
    const awayY = dy / (dist || 1);

    pos.x = clamp(pos.x + awayX * rand(90, 170), b.minX, b.maxX);
    pos.y = clamp(pos.y + awayY * rand(70, 140), b.minY, b.maxY);

    // random “chaos” to make it feel alive
    vel.x = awayX * rand(1.8, 2.6) + rand(-0.6, 0.6);
    vel.y = awayY * rand(1.4, 2.2) + rand(-0.6, 0.6);

    placeHeart();
  }
}

function tick(){
  const b = viewportBounds();

  // wander
  pos.x += vel.x;
  pos.y += vel.y;

  // bounce edges
  if (pos.x <= b.minX || pos.x >= b.maxX) vel.x *= -1;
  if (pos.y <= b.minY || pos.y >= b.maxY) vel.y *= -1;

  // small drift change
  if (Math.random() < 0.008) pickNewVel();

  placeHeart();
  requestAnimationFrame(tick);
}

function getPointer(e){
  if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

/* Track pointer globally so it can dodge anywhere */
window.addEventListener("pointermove", (e) => { target = { x: e.clientX, y: e.clientY }; }, { passive:true });
window.addEventListener("touchmove", (e) => { target = getPointer(e); }, { passive:true });

/* Dodge on hover attempt (desktop) */
roamHeart.addEventListener("pointerenter", () => dodgeFromPointer());

/* Dodge on touch attempt (mobile) */
roamHeart.addEventListener("pointerdown", (e) => {
  // If user tries to press, it dodges first sometimes, sometimes you catch it.
  // This makes it “catchable” but tricky.
  if (Math.random() < 0.55) {
    e.preventDefault();
    target = { x: e.clientX, y: e.clientY };
    dodgeFromPointer();
    return;
  }
  // Otherwise you caught it -> do the fly out + flowers
  flyOutAndReturn();
}, { passive:false });

/* Also allow click catch on desktop */
roamHeart.addEventListener("click", () => {
  flyOutAndReturn();
});

/* Fly outside + return with flowers trail */
function flyOutAndReturn(){
  const rect = roamHeart.getBoundingClientRect();
  const startX = rect.left + rect.width/2;
  const startY = rect.top + rect.height/2;

  // hide roaming heart briefly
  roamHeart.style.visibility = "hidden";

  const heart = document.createElement("div");
  heart.className = "flyHeart";
  heart.textContent = "💗";
  heart.style.left = `${startX}px`;
  heart.style.top = `${startY}px`;
  document.body.appendChild(heart);

  // fly OUT offscreen direction
  const dirX = (Math.random() < 0.5 ? -1 : 1);
  const dirY = (Math.random() < 0.6 ? -1 : 1);
  const outX = startX + dirX * (window.innerWidth * 0.7 + rand(80, 160));
  const outY = startY + dirY * (window.innerHeight * 0.55 + rand(60, 140));

  const outAnim = heart.animate(
    [
      { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" },
      { transform: `translate(${outX - startX - 50}px, ${outY - startY - 50}px) scale(1.18) rotate(${rand(-25,25)}deg)` }
    ],
    { duration: 520, easing: "cubic-bezier(.2,.9,.2,1)" }
  );

  outAnim.onfinish = () => {
    // return path with flowers
    let steps = 10, t = 0;
    const flowerTimer = setInterval(() => {
      t++;
      const px = startX + (outX - startX) * (1 - t / steps);
      const py = startY + (outY - startY) * (1 - t / steps);
      spawnFlower(px + rand(-8,8), py + rand(-8,8));
      if (t >= steps) clearInterval(flowerTimer);
    }, 70);

    const backAnim = heart.animate(
      [
        { transform: `translate(${outX - startX - 50}px, ${outY - startY - 50}px) scale(1.18) rotate(0deg)` },
        { transform: "translate(-50%, -50%) scale(1.08) rotate(0deg)" },
        { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" }
      ],
      { duration: 780, easing: "cubic-bezier(.2,.9,.2,1)" }
    );

    backAnim.onfinish = () => {
      spawnFlower(startX + rand(-10,10), startY + rand(-10,10));
      spawnFlower(startX + rand(-10,10), startY + rand(-10,10));
      heart.remove();

      // show roaming heart again and nudge to a new spot
      roamHeart.style.visibility = "visible";
      const b = viewportBounds();
      pos.x = rand(b.minX, b.maxX);
      pos.y = rand(b.minY, b.maxY);
      pickNewVel();
      placeHeart();
    };
  };
}

/* Start */
if (roamHeart){
  // start somewhere random-ish
  const b = viewportBounds();
  pos.x = rand(b.minX, b.maxX);
  pos.y = rand(b.minY, b.maxY);
  pickNewVel();
  placeHeart();
  requestAnimationFrame(tick);
}

window.addEventListener("resize", () => {
  if (!roamHeart) return;
  placeHeart();
});
