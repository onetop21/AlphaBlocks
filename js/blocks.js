// 알파블록스 스타일의 "글자 블록" 캐릭터를 SVG로 그립니다.
// 블록 몸통 + 큰 눈 + 웃는 입 + 팔/다리, 글자는 몸통 앞면에 표시.

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

let uid = 0;

/**
 * @param {string} letter
 * @param {string} color
 * @param {{mood?: 'happy'|'wow'|'sleep'|'wink', arms?: 'up'|'down'|'wave', label?: string}} opts
 */
export function blockSVG(letter, color, opts = {}) {
  const { mood = 'happy', arms = 'down', label } = opts;
  const id = `b${uid++}`;
  const top = shade(color, 45);
  const side = shade(color, -45);
  const ink = shade(color, -110);
  const textColor = isLight(color) ? ink : '#ffffff';

  const eyes = {
    happy: `
      <circle cx="38" cy="40" r="10" fill="#fff"/><circle cx="62" cy="40" r="10" fill="#fff"/>
      <circle cx="40" cy="42" r="5" fill="#1d1d2b"/><circle cx="64" cy="42" r="5" fill="#1d1d2b"/>
      <circle cx="42" cy="40" r="1.8" fill="#fff"/><circle cx="66" cy="40" r="1.8" fill="#fff"/>`,
    wow: `
      <circle cx="38" cy="39" r="11" fill="#fff"/><circle cx="62" cy="39" r="11" fill="#fff"/>
      <circle cx="38" cy="39" r="6" fill="#1d1d2b"/><circle cx="62" cy="39" r="6" fill="#1d1d2b"/>
      <circle cx="40" cy="37" r="2" fill="#fff"/><circle cx="64" cy="37" r="2" fill="#fff"/>`,
    wink: `
      <circle cx="38" cy="40" r="10" fill="#fff"/>
      <circle cx="40" cy="42" r="5" fill="#1d1d2b"/><circle cx="42" cy="40" r="1.8" fill="#fff"/>
      <path d="M53 42 q9 -8 18 0" stroke="#1d1d2b" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    sleep: `
      <path d="M29 42 q9 7 18 0" stroke="#1d1d2b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M53 42 q9 7 18 0" stroke="#1d1d2b" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  }[mood];

  const mouth = {
    happy: `<path d="M39 94 q9 9 18 0" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    wow: `<ellipse cx="48" cy="97" rx="5" ry="6" fill="${ink}"/>`,
    wink: `<path d="M38 93 q10 11 20 0 z" fill="${ink}"/>`,
    sleep: `<path d="M43 97 h10" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`,
  }[mood];

  const armPaths = {
    down: `<path d="M14 66 q-10 10 -6 22" /><path d="M86 66 q10 10 6 22" />`,
    up: `<path d="M14 62 q-12 -8 -10 -24" /><path d="M86 62 q12 -8 10 -24" />`,
    wave: `<path d="M14 66 q-10 10 -6 22" /><path d="M86 62 q12 -8 10 -24" class="wave-arm"/>`,
  }[arms];

  return `
<svg class="block-char" viewBox="-8 0 116 124" role="img" aria-label="${label ?? letter + ' 블록'}">
  <defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shade(color, 18)}"/>
      <stop offset="1" stop-color="${color}"/>
    </linearGradient>
  </defs>
  <ellipse cx="52" cy="119" rx="38" ry="4" fill="rgba(0,0,0,.15)"/>
  <g stroke="${side}" stroke-width="5" fill="none" stroke-linecap="round">${armPaths}</g>
  <g stroke="${side}" stroke-width="6" stroke-linecap="round">
    <path d="M36 108 v8"/><path d="M64 108 v8"/>
  </g>
  <path d="M14 22 l8 -10 h68 l-8 10 z" fill="${top}"/>
  <path d="M82 22 l8 -10 v86 l-8 10 z" fill="${side}"/>
  <rect x="14" y="22" width="68" height="86" rx="6" fill="url(#${id}g)"/>
  <g transform="translate(-2 0)">${eyes}</g>
  <text x="48" y="80" text-anchor="middle" font-family="Fredoka, 'Arial Rounded MT Bold', sans-serif"
        font-weight="700" font-size="32" fill="${textColor}">${letter}</text>
  ${mouth}
</svg>`;
}

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 175;
}

// 로고용 무지개 팔레트
export const RAINBOW = ['#ef3b36', '#ff8a1f', '#ffc81a', '#34b649', '#2b8cf0', '#8e5cf6', '#ff5fa2'];
