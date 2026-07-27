// Design A — "terminal": a shell session that types itself out, with the
// WakaTime numbers presented as the output of a command.
import {
  MONO, CH, esc, r2, typeAnim, growAnim, fadeIn, svgWrap, langColor,
} from '../lib/core.mjs';

const W = 880;
const PAD = 26;
const FS = 13.5;
const LH = 23;
const CHW = FS * CH;
const CHROME = 40;
const GAP = 0.62;

const NAME_COL = 13; // characters reserved for the language name
const BAR_W = 372;

export function terminal(stats, profile, t) {
  const promptX = PAD;
  const cmdX = PAD + 2 * CHW;
  const barX = PAD + NAME_COL * CHW;
  const timeX = barX + BAR_W + 18;

  // ---- script the session -------------------------------------------------
  const rows = [];
  const push = (row) => rows.push(row);

  push({ k: 'cmd', text: 'whoami' });
  push({ k: 'out', text: profile.identity, tone: 'text' });
  push({ k: 'gap' });

  push({ k: 'cmd', text: 'cat about.txt' });
  profile.about.forEach((line) => push({ k: 'out', text: line, tone: 'dim' }));
  push({ k: 'gap' });

  push({ k: 'cmd', text: 'waka --all-time' });
  push({
    k: 'out',
    text: `${stats.total}  ·  since ${stats.start.toLowerCase()}`,
    tone: 'dim',
  });
  push({ k: 'gap' });

  stats.languages.forEach((l) => push({ k: 'bar', lang: l }));
  push({ k: 'gap' });
  push({ k: 'end' });

  // ---- lay out and time it ----------------------------------------------
  let y = CHROME + 30;
  let clock = 0.35;
  let uid = 0;
  const parts = [];
  const clips = [];

  for (const row of rows) {
    if (row.k === 'gap') {
      y += LH * GAP;
      continue;
    }

    if (row.k === 'cmd') {
      const id = `t${uid++}`;
      const w = row.text.length * CHW;
      const anim = typeAnim(row.text.length, w, clock, 30);
      clips.push(
        `<clipPath id="${id}"><rect x="${r2(cmdX)}" y="${y - FS}" ` +
          `width="0" height="${FS + 6}">${anim.xml}</rect></clipPath>`
      );
      parts.push(
        `<g opacity="0">${fadeIn(clock - 0.2, 0.2)}` +
          `<text x="${promptX}" y="${y}" fill="${t.green}" font-family="${MONO}" ` +
          `font-size="${FS}" font-weight="600">&#10095;</text></g>`,
        `<g clip-path="url(#${id})"><text x="${r2(cmdX)}" y="${y}" fill="${t.text}" ` +
          `font-family="${MONO}" font-size="${FS}">${esc(row.text)}</text></g>`
      );
      clock = anim.end + 0.12;
      y += LH;
      continue;
    }

    if (row.k === 'out') {
      const fill = row.tone === 'dim' ? t.dim : t.text;
      parts.push(
        `<text x="${r2(cmdX)}" y="${y}" fill="${fill}" font-family="${MONO}" ` +
          `font-size="${FS}" opacity="0">${esc(row.text)}` +
          `${fadeIn(clock, 0.3)}</text>`
      );
      clock += 0.14;
      y += LH;
      continue;
    }

    if (row.k === 'bar') {
      const { name, text, percent } = row.lang;
      const color = langColor(name);
      const fillW = Math.max((percent / 100) * BAR_W, 3);
      const by = y - FS + 3;
      const bh = FS - 3.5;

      parts.push(
        `<g opacity="0">${fadeIn(clock, 0.28)}` +
          `<text x="${PAD}" y="${y}" fill="${t.text}" font-family="${MONO}" ` +
          `font-size="${FS}">${esc(name.toLowerCase())}</text>` +
          `<rect x="${r2(barX)}" y="${r2(by)}" width="${BAR_W}" height="${r2(bh)}" ` +
          `rx="${r2(bh / 2)}" fill="${t.track}"/>` +
          `<rect x="${r2(barX)}" y="${r2(by)}" width="0" height="${r2(bh)}" ` +
          `rx="${r2(bh / 2)}" fill="${color}">${growAnim(fillW, clock + 0.1, 0.85)}</rect>` +
          `<text x="${r2(timeX)}" y="${y}" fill="${t.dim}" font-family="${MONO}" ` +
          `font-size="${FS - 0.5}">${esc(text)}</text>` +
          `<text x="${W - PAD}" y="${y}" fill="${t.text}" font-family="${MONO}" ` +
          `font-size="${FS - 0.5}" text-anchor="end" font-weight="600">` +
          `${percent.toFixed(2)}%</text></g>`
      );
      clock += 0.1;
      y += LH;
      continue;
    }

    if (row.k === 'end') {
      parts.push(
        `<g opacity="0">${fadeIn(clock + 0.2, 0.2)}` +
          `<text x="${promptX}" y="${y}" fill="${t.green}" font-family="${MONO}" ` +
          `font-size="${FS}" font-weight="600">&#10095;</text></g>`,
        `<rect x="${r2(cmdX)}" y="${y - FS + 2}" width="${r2(CHW)}" ` +
          `height="${FS}" fill="${t.accent}" opacity="0">` +
          `<animate attributeName="opacity" values="1;1;0;0" ` +
          `calcMode="discrete" keyTimes="0;0.5;0.5;1" dur="1.06s" ` +
          `begin="${r2(clock + 0.4)}s" repeatCount="indefinite"/></rect>`
      );
      y += LH;
    }
  }

  const H = Math.round(y + PAD - 14);

  // ---- chrome ------------------------------------------------------------
  const dots = ['#FF5F57', '#FEBC2E', '#28C840']
    .map(
      (c, i) =>
        `<circle cx="${22 + i * 19}" cy="${CHROME / 2}" r="5.5" fill="${c}" ` +
        `opacity="${t.id === 'light' ? 0.95 : 0.9}"/>`
    )
    .join('');

  const body = `
<defs>
  ${clips.join('\n  ')}
  <linearGradient id="hair" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${t.accent}" stop-opacity="0"/>
    <stop offset="0.25" stop-color="${t.accent}" stop-opacity="0.9"/>
    <stop offset="0.6" stop-color="${t.accent2}" stop-opacity="0.5"/>
    <stop offset="1" stop-color="${t.accent2}" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="lift" cx="0.5" cy="0" r="0.85">
    <stop offset="0" stop-color="${t.accent}" stop-opacity="${t.id === 'light' ? 0.07 : 0.14}"/>
    <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="13"
      fill="${t.panel}" stroke="${t.border}" stroke-width="1.5"/>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="13" fill="url(#lift)"/>
<path d="M13.75 0.75 H${W - 13.75} A13 13 0 0 1 ${W - 0.75} 13.75 V${CHROME}
         H0.75 V13.75 A13 13 0 0 1 13.75 0.75 Z"
      fill="${t.panelAlt}"/>
<line x1="0.75" y1="${CHROME}" x2="${W - 0.75}" y2="${CHROME}"
      stroke="${t.border}" stroke-width="1"/>
<rect x="0.75" y="${CHROME - 0.75}" width="${W - 1.5}" height="1.5" fill="url(#hair)"/>
${dots}
<text x="${W / 2}" y="${CHROME / 2 + 4}" fill="${t.faint}" font-family="${MONO}"
      font-size="11.5" text-anchor="middle" letter-spacing="0.4">${esc(profile.host)}  —  zsh</text>
${parts.join('\n')}
`;

  return svgWrap({
    w: W,
    h: H,
    title: `${profile.handle} — terminal profile card`,
    desc: `${stats.total} of tracked coding time since ${stats.start}. Top language ${stats.languages[0]?.name} at ${stats.languages[0]?.percent}%.`,
    body,
  });
}
