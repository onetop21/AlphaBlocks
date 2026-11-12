import { LEVELS, ALL_VIDEOS, VIDEO_IDS, thumb } from './data.js';
import { blockSVG, RAINBOW } from './blocks.js';

// YouTube 임베드는 127.0.0.1 IP 주소에서 오류(150/153)를 반환하므로 localhost로 자동 전환합니다.
if (location.hostname === '127.0.0.1') {
  location.replace(location.href.replace('127.0.0.1', 'localhost'));
}

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rand = (n) => Math.floor(Math.random() * n);
const durSec = (d) => d.split(':').reduce((a, b) => a * 60 + +b, 0);
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/* =========================================================
 * 저장 상태 (localStorage)
 * ========================================================= */
const KEY = 'alphablocks-tv-v1';
const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD (현지 시간)
const DEFAULTS = {
  watched: {},          // { videoId: timestamp } 끝까지 본 영상 = 별
  pos: {},              // { videoId: seconds } 이어보기 위치
  last: null,           // 마지막으로 본 영상
  settings: { limit: 0, autoplay: true, sound: true },
  day: { date: today(), sec: 0, bonus: 0 },
};
let S = load();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)) || {};
    return {
      ...structuredClone(DEFAULTS),
      ...s,
      settings: { ...DEFAULTS.settings, ...s.settings },
      day: s.day ?? structuredClone(DEFAULTS.day),
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
function rollDay() {
  if (S.day.date !== today()) { S.day = { date: today(), sec: 0, bonus: 0 }; save(); }
}
const limitSec = () => (S.settings.limit ? (S.settings.limit + S.day.bonus) * 60 : Infinity);
const isTimeUp = () => { rollDay(); return S.day.sec >= limitSec(); };

/* =========================================================
 * 효과음 (WebAudio, 파일 없이)
 * ========================================================= */
let actx;
function blip(freq = 620, dur = 0.12) {
  if (!S.settings.sound) return;
  try {
    actx ??= new AudioContext();
    const t = actx.currentTime;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.7, t + dur);
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch { /* 무시 */ }
}
function fanfare() {
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.18), i * 120));
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && !b.dataset.parent) blip(500 + rand(300));
});

/* =========================================================
 * 테마 (레벨 색상)
 * ========================================================= */
function setTheme(lv) {
  const r = document.documentElement.style;
  r.setProperty('--lv', lv.color);
  r.setProperty('--lv-dark', lv.dark);
  r.setProperty('--lv-light', lv.light);
  document.querySelector('meta[name=theme-color]').content = lv.color;
}
const lvVars = (lv) => `--lv:${lv.color};--lv-dark:${lv.dark};--lv-light:${lv.light}`;
const isYellow = (lv) => lv.id === 3;

/* =========================================================
 * 라우터 (#/ , #/level/2 , #/play/VIDEO_ID)
 * ========================================================= */
const views = { home: $('#view-home'), level: $('#view-level'), player: $('#view-player') };
function show(name) {
  for (const [k, el] of Object.entries(views)) el.hidden = k !== name;
  window.scrollTo(0, 0);
}
function route() {
  const [, a, b] = (location.hash.slice(1) || '/').split('/');
  if (a !== 'play') leavePlayer();
  if (a === 'level' && LEVELS[b - 1]) renderLevel(+b);
  else if (a === 'play' && VIDEO_IDS.has(b)) showPlayer(b);
  else renderHome();
  if (isTimeUp()) showTimeUp();
}
const go = (hash) => { location.hash = hash; };
window.addEventListener('hashchange', route);

/* =========================================================
 * 홈
 * ========================================================= */
function starsIn(lv) { return lv.videos.filter((v) => S.watched[v.id]).length; }

function renderHome() {
  show('home');
  setTheme({ color: '#5ec8ff', dark: '#2a8fd0', light: '#d8f3ff' });

  $('#logo').innerHTML = [...'Alphablocks']
    .map((ch, i) => `<span style="--c:${RAINBOW[i % RAINBOW.length]};--i:${i}">${ch}</span>`)
    .join('');

  $('#hero-blocks').innerHTML =
    blockSVG('a', '#ef3b36', { arms: 'wave' }) +
    blockSVG('b', '#ffc81a', { mood: 'wink' }) +
    blockSVG('c', '#2b8cf0', { arms: 'up', mood: 'wow' });

  const total = ALL_VIDEOS.filter((v) => S.watched[v.id]).length;
  $('#stars-total').innerHTML = `⭐ 모은 별 <b>${total}</b> / ${ALL_VIDEOS.length}`;

  // 이어보기
  const last = S.last && ALL_VIDEOS.find((v) => v.id === S.last);
  if (last) {
    const next = S.watched[last.id] && !S.pos[last.id] ? ALL_VIDEOS[ALL_VIDEOS.indexOf(last) + 1] : last;
    const target = next ?? last;
    const tlv = LEVELS[target.level - 1];
    $('#continue-slot').innerHTML = `
      <button class="continue" style="${lvVars(tlv)}" data-play="${target.id}" type="button">
        <img src="${thumb(target.id, 'mqdefault')}" alt="" loading="lazy">
        <span>
          <span class="c-label">${target === last ? '이어서 보기' : '다음 영상 보기'} · ${esc(tlv.ko)}</span>
          <span class="c-title">${esc(target.titles.join(' · '))}</span>
        </span>
        <span class="c-play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg></span>
      </button>`;
  } else {
    $('#continue-slot').innerHTML = '';
  }

  $('#levels').innerHTML = LEVELS.map((lv, i) => {
    const n = starsIn(lv);
    const p = Math.round((n / lv.videos.length) * 100);
    return `
      <li>
        <button class="level-card ${isYellow(lv) ? 'dark-text' : ''}" style="${lvVars(lv)}" data-level="${lv.id}" type="button">
          <span class="mascot">${blockSVG(lv.mascot, lv.light, { arms: i % 2 ? 'wave' : 'up', mood: ['happy', 'wink', 'wow'][i % 3] })}</span>
          <span style="flex:1;min-width:0">
            <span class="lv-num">LEVEL ${lv.id} · ${esc(lv.subtitle)}</span>
            <span class="lv-name">${esc(lv.ko)}</span>
            <span class="lv-desc">${esc(lv.desc)}</span>
            <span class="lv-progress"><span class="bar"><i style="--p:${p}%"></i></span> ⭐ ${n}/${lv.videos.length}</span>
          </span>
        </button>
      </li>`;
  }).join('');
}

/* =========================================================
 * 레벨 화면
 * ========================================================= */
const PLAY_ICON = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>';

function renderLevel(n) {
  const lv = LEVELS[n - 1];
  show('level');
  setTheme(lv);
  const head = $('#level-head');
  head.classList.toggle('dark-text', isYellow(lv));
  head.innerHTML = `
    <button class="round-btn" data-go="#/" type="button" aria-label="처음으로">
      <svg viewBox="0 0 24 24"><path d="M15.5 4.5a1.5 1.5 0 0 1 0 2.12L10.12 12l5.38 5.38a1.5 1.5 0 1 1-2.12 2.12l-6.44-6.44a1.5 1.5 0 0 1 0-2.12l6.44-6.44a1.5 1.5 0 0 1 2.12 0Z"/></svg>
    </button>
    <div>
      <small>LEVEL ${lv.id} · ${esc(lv.subtitle)}</small>
      <h2>${esc(lv.ko)}</h2>
      <small>⭐ ${starsIn(lv)} / ${lv.videos.length}</small>
    </div>
    <span class="mascot">${blockSVG(lv.mascot, lv.light, { arms: 'wave' })}</span>`;

  $('#videos').innerHTML = lv.videos.map((v) => {
    const watched = !!S.watched[v.id];
    const pos = S.pos[v.id];
    const p = pos ? Math.min(100, (pos / durSec(v.dur)) * 100) : 0;
    return `
      <li>
        <button class="video-card" data-play="${v.id}" type="button">
          <span class="thumb">
            <img src="${thumb(v.id, 'mqdefault')}" alt="" loading="lazy" decoding="async">
            <span class="ep ${isYellow(lv) ? 'dark-text' : ''}">${v.ep}화</span>
            <span class="dur">${v.dur}</span>
            ${watched ? '<span class="watched" aria-label="다 봤어요">⭐</span>' : ''}
            ${p > 2 ? `<span class="resume"><i style="--p:${p}%"></i></span>` : ''}
            <span class="play-badge">${PLAY_ICON}</span>
          </span>
          <span class="v-titles">${v.titles.map((t) => `<span>${esc(t)}</span>`).join('')}</span>
          <span class="v-note">${esc(v.note)}</span>
        </button>
      </li>`;
  }).join('');
}

// 사용자 터치 제스처 안에서 바로 영상을 로드해 모바일 자동재생 차단을 방지
function playImmediate(v) {
  if (!v || !ytReady || isTimeUp()) return;
  loadedId = v.id;
  player.loadVideoById({ videoId: v.id, startSeconds: resumeFrom(v) });
}

// 위임 클릭: 레벨/영상/이동
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-level],[data-play],[data-go]');
  if (!el) return;
  if (el.dataset.level) go(`#/level/${el.dataset.level}`);
  else if (el.dataset.play) {
    const id = el.dataset.play;
    playImmediate(ALL_VIDEOS.find((x) => x.id === id));
    go(`#/play/${id}`);
  } else if (el.dataset.go) go(el.dataset.go);
});

/* =========================================================
 * 플레이어 (YouTube IFrame API + 보호막 + 자체 컨트롤)
 * ========================================================= */
const YTS = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };
let player = null;
let ytReady = false;
let loadedId = null;
let apiPromise = null;
let current = null;
let tickTimer = 0;
let lastTick = 0;
let lastSave = 0;
let seeking = false;
let hideTimer = 0;
let countdown = 0;
let autoplayCheck = 0;
let ended = false;

const controls = $('#controls');
const seek = $('#seek');

function loadApi() {
  if (window.YT?.Player) return Promise.resolve();
  return (apiPromise ??= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.append(s);
  }));
}

// 앱 시작 시 플레이어를 미리 준비해 두어 영상 카드를 누르면 바로 재생되게 함
function ensurePlayer(initialId = ALL_VIDEOS[0].id, autoplay = 0, start = 0) {
  if (player) return;
  player = new YT.Player('yt', {
    videoId: initialId,
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay,
      controls: 0,          // 유튜브 기본 컨트롤 숨김 (자체 컨트롤 사용)
      disablekb: 1,
      fs: 0,
      rel: 0,               // 관련 영상은 같은 채널로 제한
      modestbranding: 1,
      iv_load_policy: 3,    // 특수효과(카드) 숨김
      playsinline: 1,
      cc_load_policy: 0,
      start,
      hl: 'ko',
    },
    events: { onReady, onStateChange, onError },
  });
}

const idx = (v) => ALL_VIDEOS.findIndex((x) => x.id === v.id);
const nextOf = (v) => ALL_VIDEOS[idx(v) + 1] ?? null;
const prevOf = (v) => ALL_VIDEOS[idx(v) - 1] ?? null;

function resumeFrom(v) {
  const p = S.pos[v.id];
  return p && p < durSec(v.dur) - 15 ? Math.max(0, Math.floor(p) - 2) : 0;
}

function showCover(name) {
  for (const n of ['loading', 'pause', 'end', 'error']) $(`#cover-${n}`).hidden = n !== name;
}

async function showPlayer(id) {
  const v = ALL_VIDEOS.find((x) => x.id === id);
  const lv = LEVELS[v.level - 1];
  current = v;
  ended = false;
  stopCountdown();
  setTheme(lv);
  show('player');
  S.last = id;
  save();
  renderNow(v, lv);
  views.player.classList.remove('playing');
  $('#loading-blocks').innerHTML = [...'abc'].map((c, i) => blockSVG(c, RAINBOW[(lv.id + i) % 5])).join('');
  $('#pause-char').innerHTML = blockSVG(lv.mascot, lv.light, { arms: 'wave', mood: 'wink' });
  $('#pause-title').textContent = v.titles.join(' · ');
  showCover('loading');
  updateTime(0, durSec(v.dur));
  startTick();

  if (isTimeUp()) { showTimeUp(); return; }

  await loadApi();
  if (current !== v) return;
  const start = resumeFrom(v);

  if (!player) {
    loadedId = id;
    ensurePlayer(id, 1, start);
  } else if (ytReady) {
    if (loadedId !== id) {
      loadedId = id;
      player.loadVideoById({ videoId: id, startSeconds: start });
    }
    armAutoplayCheck();
  }
}

function onReady() {
  ytReady = true;
  const iframe = player.getIframe();
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('title', '알파블록스 영상');
  if (!current) return;
  const start = resumeFrom(current);
  if (loadedId !== current.id) {
    loadedId = current.id;
    player.loadVideoById({ videoId: current.id, startSeconds: start });
  } else {
    player.playVideo();
  }
  armAutoplayCheck();
}

// 모바일에서 자동재생이 막히면 큰 재생 버튼을 보여줌
function armAutoplayCheck() {
  clearTimeout(autoplayCheck);
  autoplayCheck = setTimeout(() => {
    if (!current || !player?.getPlayerState) return;
    if (!$('#cover-error').hidden) return;
    const s = player.getPlayerState();
    if (s !== YTS.PLAYING && s !== YTS.ENDED) showCover('pause');
  }, 1800);
}

function onStateChange(e) {
  if (views.player.hidden) return;
  switch (e.data) {
    case YTS.PLAYING:
      clearTimeout(autoplayCheck);
      ended = false;
      showCover(null);
      views.player.classList.add('playing');
      setWakeLock(true);
      scheduleHide();
      if (isTimeUp()) { player.pauseVideo(); showTimeUp(); }
      break;
    case YTS.PAUSED:
      views.player.classList.remove('playing');
      if (!ended) showCover('pause');
      showControls();
      setWakeLock(false);
      break;
    case YTS.CUED:
      showCover('pause');
      break;
    case YTS.ENDED:
      onEnded();
      break;
  }
}

function onError() {
  clearTimeout(autoplayCheck);
  views.player.classList.remove('playing');
  showCover('error');
  $('#error-char').innerHTML = `<div class="bounce-blocks" style="height:90px">${blockSVG('?', '#ff8a1f', { mood: 'wow', arms: 'up' })}</div>`;
  $('#error-next').hidden = !nextOf(current);
}

function onEnded() {
  if (ended) return;
  ended = true;
  views.player.classList.remove('playing');
  setWakeLock(false);
  S.watched[current.id] = Date.now();
  delete S.pos[current.id];
  save();

  const lv = LEVELS[current.level - 1];
  showCover('end');
  $('#end-sub').textContent = `${lv.ko} 별 ${starsIn(lv)} / ${lv.videos.length}개 모았어요!`;
  burstConfetti();
  fanfare();
  showControls();

  const next = nextOf(current);
  const btn = $('#end-next');
  btn.hidden = !next;
  btn.textContent = '다음 영상 ▶';
  if (next && S.settings.autoplay && !isTimeUp()) {
    let n = 10;
    btn.textContent = `다음 영상 ▶ ${n}`;
    countdown = setInterval(() => {
      n -= 1;
      btn.textContent = `다음 영상 ▶ ${n}`;
      if (n <= 0) { stopCountdown(); location.replace(`#/play/${next.id}`); }
    }, 1000);
  }
  if (isTimeUp()) showTimeUp();
}

function stopCountdown() { clearInterval(countdown); countdown = 0; }

function burstConfetti() {
  const box = $('#confetti');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  box.innerHTML = Array.from({ length: 28 }, () =>
    `<i style="left:${rand(96)}%;--c:${RAINBOW[rand(RAINBOW.length)]};--d:${2 + Math.random() * 2.5}s;--delay:${Math.random()}s;--r:${rand(720) - 360}deg">${letters[rand(26)]}</i>`
  ).join('');
}

function renderNow(v, lv) {
  const next = nextOf(v);
  $('#now').innerHTML = `
    <span class="n-lv" style="${isYellow(lv) ? 'color:#4a3500' : ''}">${esc(lv.ko)} · ${v.ep}화</span>
    <div class="n-title">${esc(v.titles.join(' · '))}</div>
    <div class="n-note">${esc(v.note)}</div>
    ${next ? `
      <button class="up-next" data-replace="${next.id}" type="button">
        <img src="${thumb(next.id, 'mqdefault')}" alt="" loading="lazy">
        <span><small>다음 영상</small>${esc(next.titles.join(' · '))}</span>
      </button>` : ''}`;
  $('#c-prev').disabled = !prevOf(v);
  $('#c-next').disabled = !next;
}

function startTick() {
  clearInterval(tickTimer);
  lastTick = performance.now();
  tickTimer = setInterval(tick, 500);
}
function stopTick() { clearInterval(tickTimer); tickTimer = 0; }

function tick() {
  const now = performance.now();
  const dt = Math.min((now - lastTick) / 1000, 2);
  lastTick = now;
  if (!ytReady || !current || !player.getCurrentTime) return;
  const t = player.getCurrentTime();
  const d = player.getDuration() || durSec(current.dur);
  if (!seeking) updateTime(t, d);
  if (player.getPlayerState() === YTS.PLAYING) {
    S.day.sec += dt;
    if (now - lastSave > 5000) {
      S.pos[current.id] = t;
      save();
      lastSave = now;
    }
    if (isTimeUp()) { player.pauseVideo(); save(); showTimeUp(); }
  }
}

function updateTime(t, d) {
  seek.max = Math.max(1, Math.floor(d));
  seek.value = Math.floor(t);
  seek.style.setProperty('--p', `${(t / d) * 100 || 0}%`);
  $('#t-cur').textContent = fmt(t);
  $('#t-dur').textContent = fmt(d);
}

function leavePlayer() {
  stopTick();
  stopCountdown();
  clearTimeout(autoplayCheck);
  if (current && ytReady && player.getCurrentTime) {
    const t = player.getCurrentTime();
    if (!ended && t > 5) S.pos[current.id] = t;
    save();
    player.pauseVideo();
  }
  current = null;
  loadedId = null;
  setWakeLock(false);
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

// 컨트롤 표시/숨김 (가로 모드에서만 실제로 숨겨짐)
function showControls() { controls.classList.remove('auto-hide'); clearTimeout(hideTimer); }
function scheduleHide() {
  showControls();
  hideTimer = setTimeout(() => {
    if (views.player.classList.contains('playing')) controls.classList.add('auto-hide');
  }, 3500);
}

// 보호막 탭 → 컨트롤 보이기/숨기기 (유튜브 화면은 절대 눌리지 않음)
$('#shield').addEventListener('click', () => {
  if (controls.classList.contains('auto-hide')) scheduleHide();
  else if (views.player.classList.contains('playing')) controls.classList.add('auto-hide');
});
controls.addEventListener('pointerdown', () => scheduleHide());

$('#c-play').addEventListener('click', () => {
  if (!ytReady) return;
  if (player.getPlayerState() === YTS.PLAYING) player.pauseVideo();
  else if (!isTimeUp()) player.playVideo();
});
$('#big-play').addEventListener('click', () => {
  if (ytReady && !isTimeUp()) player.playVideo();
});
$('#c-prev').addEventListener('click', () => {
  const p = current && prevOf(current);
  if (p) { playImmediate(p); location.replace(`#/play/${p.id}`); }
});
$('#c-next').addEventListener('click', () => {
  const n = current && nextOf(current);
  if (n) { playImmediate(n); location.replace(`#/play/${n.id}`); }
});
$('#c-back').addEventListener('click', () => go(`#/level/${current?.level ?? 1}`));
$('#now').addEventListener('click', (e) => {
  const b = e.target.closest('[data-replace]');
  if (b) {
    const n = ALL_VIDEOS.find((x) => x.id === b.dataset.replace);
    playImmediate(n);
    location.replace(`#/play/${b.dataset.replace}`);
  }
});

seek.addEventListener('input', () => {
  seeking = true;
  const d = +seek.max;
  seek.style.setProperty('--p', `${(seek.value / d) * 100}%`);
  $('#t-cur').textContent = fmt(+seek.value);
});
seek.addEventListener('change', () => {
  if (ytReady) player.seekTo(+seek.value, true);
  seeking = false;
});

// 끝 화면 / 오류 화면 버튼
$('#end-replay').addEventListener('click', () => {
  stopCountdown();
  ended = false;
  showCover(null);
  player.seekTo(0, true);
  player.playVideo();
});
$('#end-next').addEventListener('click', () => {
  stopCountdown();
  const n = nextOf(current);
  if (n) { playImmediate(n); location.replace(`#/play/${n.id}`); }
});
$('#end-list').addEventListener('click', () => go(`#/level/${current?.level ?? 1}`));
$('#error-list').addEventListener('click', () => go(`#/level/${current?.level ?? 1}`));
$('#error-next').addEventListener('click', () => {
  const n = nextOf(current);
  if (n) { playImmediate(n); location.replace(`#/play/${n.id}`); }
});

// 전체 화면 (지원 기기만)
const fullBtn = $('#c-full');
if (!document.fullscreenEnabled) fullBtn.hidden = true;
fullBtn.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      await screen.orientation?.lock?.('landscape').catch(() => {});
    }
  } catch { /* 무시 */ }
});

// 다른 앱으로 전환되면 일시정지 + 위치 저장
document.addEventListener('visibilitychange', () => {
  if (document.hidden && current && ytReady) {
    S.pos[current.id] = player.getCurrentTime();
    save();
    player.pauseVideo();
  } else if (!document.hidden && views.player.classList.contains('playing')) {
    setWakeLock(true);
  }
});

// 화면 꺼짐 방지
let wakeLock = null;
async function setWakeLock(on) {
  try {
    if (on && !wakeLock && 'wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch { /* 무시 */ }
}

/* =========================================================
 * 오늘 시청 끝 화면
 * ========================================================= */
function showTimeUp() {
  if (ytReady && player.getPlayerState?.() === YTS.PLAYING) player.pauseVideo();
  stopCountdown();
  $('#timeup-blocks').innerHTML =
    blockSVG('z', '#8e5cf6', { mood: 'sleep' }) + blockSVG('z', '#2b8cf0', { mood: 'sleep' });
  $('#timeup').hidden = false;
}

/* =========================================================
 * 부모 확인 (길게 누르기 + 곱셈 문제)
 * ========================================================= */
const gate = $('#gate');
let gateAnswer = 0;
let gateVal = '';

document.querySelectorAll('[data-parent]').forEach((btn) => {
  let t = 0;
  const cancel = () => { clearTimeout(t); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('holding');
    t = setTimeout(() => { cancel(); openGate(); }, 2000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, cancel));
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  // 키보드 사용자(Enter/Space)는 바로 열기
  btn.addEventListener('click', (e) => { if (e.detail === 0) openGate(); });
});

const keypad = $('#keypad');
keypad.innerHTML = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK']
  .map((k) => `<button type="button" data-k="${k}">${k}</button>`)
  .join('');

function openGate() {
  const a = 3 + rand(7);
  const b = 3 + rand(7);
  gateAnswer = a * b;
  gateVal = '';
  $('#gate-q').textContent = `${a} × ${b} = ?`;
  $('#gate-input').textContent = '';
  gate.showModal();
}

keypad.addEventListener('click', (e) => {
  const k = e.target.closest('[data-k]')?.dataset.k;
  if (!k) return;
  const out = $('#gate-input');
  out.classList.remove('wrong');
  if (k === '⌫') gateVal = gateVal.slice(0, -1);
  else if (k === 'OK') {
    if (+gateVal === gateAnswer) {
      gate.close('ok');
      openSettings();
      return;
    }
    gateVal = '';
    void out.offsetWidth;
    out.classList.add('wrong');
  } else if (gateVal.length < 3) gateVal += k;
  out.textContent = gateVal;
});

/* =========================================================
 * 부모 설정
 * ========================================================= */
const settings = $('#settings');
const LIMITS = [0, 15, 30, 45, 60, 90];

function renderSettings() {
  rollDay();
  const mins = Math.floor(S.day.sec / 60);
  const lim = S.settings.limit ? `${S.settings.limit + S.day.bonus}분` : '제한 없음';
  $('#today').textContent = `${mins}분 시청 · ${lim}`;
  $('#add-15').disabled = !S.settings.limit;
  $('#limit-chips').innerHTML = LIMITS.map((m) =>
    `<button type="button" role="radio" aria-checked="${S.settings.limit === m}" data-limit="${m}">${m ? `${m}분` : '없음'}</button>`
  ).join('');
  $('#opt-autoplay').checked = S.settings.autoplay;
  $('#opt-sound').checked = S.settings.sound;
}
function openSettings() {
  renderSettings();
  settings.showModal();
}

$('#limit-chips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-limit]');
  if (!b) return;
  S.settings.limit = +b.dataset.limit;
  S.day.bonus = 0;
  save();
  renderSettings();
});
$('#add-15').addEventListener('click', () => { S.day.bonus += 15; save(); renderSettings(); });
$('#reset-today').addEventListener('click', () => { S.day.sec = 0; S.day.bonus = 0; save(); renderSettings(); });
$('#opt-autoplay').addEventListener('change', (e) => { S.settings.autoplay = e.target.checked; save(); });
$('#opt-sound').addEventListener('change', (e) => { S.settings.sound = e.target.checked; save(); });
$('#reset-all').addEventListener('click', () => {
  if (!confirm('모은 별과 이어보기 기록을 모두 지울까요?')) return;
  S.watched = {};
  S.pos = {};
  S.last = null;
  save();
  renderSettings();
});

settings.addEventListener('close', () => {
  save();
  if (!isTimeUp()) $('#timeup').hidden = true;
  if (views.player.hidden) route();
});

/* =========================================================
 * 시작
 * ========================================================= */
route();
// 홈/레벨 화면을 보는 동안 백그라운드에서 YouTube 플레이어를 미리 준비
loadApi().then(() => { if (!player) ensurePlayer(); });

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
