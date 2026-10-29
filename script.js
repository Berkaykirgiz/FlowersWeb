'use strict';

// Çiçeklerin sırayla açılmasına izin veriyoruz; sonra buketin içinden zarf çıkıyor.
const bouquetArea = document.querySelector('.bouquet-area');
const envelopeButton = document.getElementById('openLetter');
const replayButton = document.getElementById('replayBouquet');
const letterModal = document.getElementById('letterModal');
const closeButton = document.getElementById('closeLetter');
const backdrop = document.getElementById('modalBackdrop');
const heartsContainer = document.getElementById('floatingHearts');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let revealTimer;
let previousFocus = null;
let heartTimers = [];

function revealEnvelope() {
  envelopeButton.disabled = false;
  bouquetArea.classList.add('is-ready');
}

function startBouquet() {
  clearTimeout(revealTimer);
  envelopeButton.disabled = true;
  bouquetArea.classList.remove('is-ready');

  // CSS animasyonlarını baştan oynatmak için SVG'yi kısa süreliğine yeniden oluştur.
  const oldSvg = bouquetArea.querySelector('.bouquet');
  const freshSvg = oldSvg.cloneNode(true);
  oldSvg.replaceWith(freshSvg);

  revealTimer = window.setTimeout(revealEnvelope, reduceMotion.matches ? 0 : 4200);
}

function sprinkleHearts() {
  heartsContainer.replaceChildren();
  heartTimers.forEach(clearTimeout);
  heartTimers = [];

  if (reduceMotion.matches) return;

  for (let i = 0; i < 16; i++) {
    const heart = document.createElement('span');
    heart.className = 'float-heart';
    heart.textContent = i % 3 === 0 ? '♡' : '♥';
    heart.style.color = i % 2 === 0 ? '#e6a3b8' : '#f8c6d0';
    heart.style.setProperty('--x', `${8 + Math.random() * 84}%`);
    heart.style.setProperty('--size', `${15 + Math.random() * 20}px`);
    heart.style.setProperty('--drift', `${-65 + Math.random() * 130}px`);
    heart.style.setProperty('--duration', `${3 + Math.random() * 2}s`);
    heart.style.setProperty('--wait', `${Math.random() * 1.2}s`);
    heartsContainer.appendChild(heart);
  }

  heartTimers.push(window.setTimeout(() => heartsContainer.replaceChildren(), 6500));
}

function openLetter() {
  if (envelopeButton.disabled) return;
  previousFocus = document.activeElement;
  letterModal.hidden = false;
  document.body.classList.add('modal-open');
  closeButton.focus();
  sprinkleHearts();
}

function closeLetter() {
  if (letterModal.hidden) return;
  letterModal.hidden = true;
  document.body.classList.remove('modal-open');
  heartsContainer.replaceChildren();
  if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
}

envelopeButton.addEventListener('click', openLetter);
closeButton.addEventListener('click', closeLetter);
backdrop.addEventListener('click', closeLetter);
replayButton.addEventListener('click', () => {
  closeLetter();
  startBouquet();
});

document.addEventListener('keydown', (event) => {
  if (letterModal.hidden) return;
  if (event.key === 'Escape') closeLetter();
  // Not açıksa odağı kapatma düğmesinde tut; arkadaki butonlara geçmesin.
  if (event.key === 'Tab') {
    event.preventDefault();
    closeButton.focus();
  }
});

startBouquet();


// Yalın – Cumhuriyet: sağladığın muzik.mp3 dosyasının 01:12 anından çalar.
// Sesli otomatik oynatma tarayıcı tarafından engellenebilir; düğme yedektir.
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const musicText = document.getElementById('musicText');
const MUSIC_START = 72;
let hasStartedMusic = false;

function syncMusicButton() {
  const playing = !backgroundMusic.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Müziği duraklat' : 'Müziği başlat');
  musicText.textContent = playing ? 'müziği durdur ♡' : 'müziği aç ♡';
}

function seekToSongStart() {
  if (hasStartedMusic) return;
  if (Number.isFinite(backgroundMusic.duration) && backgroundMusic.duration <= MUSIC_START) return;
  try { backgroundMusic.currentTime = MUSIC_START; } catch (_) { /* metadata henüz hazır değil */ }
}

backgroundMusic.addEventListener('loadedmetadata', seekToSongStart);
backgroundMusic.addEventListener('play', syncMusicButton);
backgroundMusic.addEventListener('pause', syncMusicButton);
backgroundMusic.addEventListener('error', () => {
  musicText.textContent = 'muzik.mp3 ekle ♡';
  musicToggle.setAttribute('aria-label', 'Müzik dosyası bulunamadı');
});

async function startMusic() {
  if (!hasStartedMusic) seekToSongStart();
  try {
    await backgroundMusic.play();
    hasStartedMusic = true;
    syncMusicButton();
  } catch (_) {
    // iOS Safari / Chrome sesli autoplay'i reddedebilir.
    syncMusicButton();
  }
}

musicToggle.addEventListener('click', () => {
  if (backgroundMusic.paused) startMusic();
  else backgroundMusic.pause();
});

// Site açıldığında çalmayı dene; tarayıcı engellerse ilk dokunuşta başlat.
window.addEventListener('load', startMusic);
document.addEventListener('pointerdown', (event) => {
  if (!hasStartedMusic && event.target.closest('#musicToggle') === null) startMusic();
}, { once: true });
