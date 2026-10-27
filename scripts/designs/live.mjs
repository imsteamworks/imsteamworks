import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FONTS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fonts');
const b64 = (file) => fs.readFileSync(path.join(FONTS, file)).toString('base64');

const C = {
  bg: '#121212',
  cream: '#ece6d8',
  muted: '#a8a297',
  lime: '#b6e35c',
  purple: '#7d34d8',
  lilac: '#c59cf5',
  line: '#333333',
};
const BAR = [C.lime, C.purple, C.cream, '#8a8478', '#5a554d', '#3d3a35'];

const W = 830;
const PAD = 30;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r = (n) => Math.round(n * 100) / 100;
const num = (n) => Math.floor(n).toLocaleString('en-US');

function svg(height, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}" role="img" aria-label="${esc(label)}">
<style>
@font-face{font-family:A;src:url(data:font/woff2;base64,${b64('archivo-62-800.woff2')}) format('woff2')}
@font-face{font-family:M;src:url(data:font/woff2;base64,${b64('plex-mono-400.woff2')}) format('woff2')}
.a{font-family:A,'Archivo Narrow','Arial Narrow',sans-serif;font-weight:800;text-transform:uppercase}
.m{font-family:M,'IBM Plex Mono',ui-monospace,monospace}
</style>
${body}
</svg>
`;
}

export function statsBand(stats, { codingSince }) {
  const java = stats.languages.find((l) => l.name === 'Java');
  const years = new Date().getUTCFullYear() - codingSince;
  const cells = [
    [num(stats.totalHours), 'Hours tracked, all time', C.cream],
    [`${java ? (Math.round(java.percent * 10) / 10).toFixed(1) : '0.0'}%`, 'Of it in Java', C.cream],
    [`${years} YRS`, 'Writing code', C.lime],
  ];
  const body = [`<rect width="${W}" height="115" fill="${C.purple}"/>`];
  cells.forEach(([value, label, color], i) => {
    const x = r(PAD + i * 263.5);
    body.push(
      `<text class="a" x="${x}" y="61.5" font-size="48" fill="${color}">${esc(value)}</text>`,
      `<text class="m" x="${x}" y="86" font-size="12" fill="${C.cream}">${esc(label)}</text>`
    );
  });
  return svg(
    115,
    body.join('\n'),
    `${num(stats.totalHours)} hours tracked · ${cells[1][0]} Java · ${years} years writing code`
  );
}

export function languagePanel(stats) {
  const langs = stats.languages.slice(0, 6);
  const rows = Math.ceil(langs.length / 2);
  const liveTop = 84 + rows * 41;
  const height = liveTop + 45;
  const body = [
    `<rect width="${W}" height="${height}" fill="${C.bg}"/>`,
    `<rect x="${PAD}" y="24" width="${W - PAD * 2}" height="1" fill="${C.cream}"/>`,
    `<text class="a" font-size="30" fill="${C.cream}"><tspan x="${PAD}" y="65.5">Time</tspan><tspan x="${PAD}" y="94">Spent</tspan></text>`,
  ];

  const sum = langs.reduce((s, l) => s + l.percent, 0) || 1;
  const gap = 2;
  const avail = 600 - gap * (langs.length - 1);
  let x = 200;
  langs.forEach((l, i) => {
    const w = i === langs.length - 1 ? 800 - x : (avail * l.percent) / sum;
    body.push(`<rect x="${r(x)}" y="41" width="${r(Math.max(w, 1))}" height="14" fill="${BAR[i]}"/>`);
    x += w + gap;
  });

  langs.forEach((l, i) => {
    const colX = 200 + (i % 2) * 312;
    const row = Math.floor(i / 2);
    const y = 98.5 + row * 41;
    const color = i === 0 ? C.lime : i === 1 ? C.lilac : C.muted;
    body.push(
      `<text class="a" x="${colX}" y="${y}" font-size="22" fill="${C.cream}">${esc(l.name)}</text>`,
      `<text class="m" x="${colX + 288}" y="${y}" font-size="12" fill="${color}" text-anchor="end">${l.percent.toFixed(2)}% · ${num(l.hours)} hrs</text>`
    );
    if (row < rows - 1) {
      body.push(`<rect x="${colX}" y="${111 + row * 41}" width="288" height="1" fill="${C.line}"/>`);
    }
  });

  const since = new Date(stats.startISO || stats.start).getUTCFullYear();
  body.push(
    `<rect x="200" y="${liveTop}" width="51" height="20" fill="${C.lime}"/>`,
    `<rect x="207" y="${liveTop + 7}" width="6" height="6" fill="${C.bg}"/>`,
    `<text class="a" x="219" y="${liveTop + 14.7}" font-size="14" letter-spacing="0.56" fill="${C.bg}">Live</text>`,
    `<text class="m" x="261.5" y="${liveTop + 14}" font-size="11" fill="${C.muted}">WakaTime · since ${since}</text>`
  );

  const alt = langs.map((l) => `${l.name} ${l.percent.toFixed(2)}%`).join(', ');
  return svg(height, body.join('\n'), `Time spent by language, via WakaTime: ${alt}`);
}
