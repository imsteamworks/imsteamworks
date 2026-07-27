// The "some of my work" section and the contact row.
//
// These were plain markdown, which meant GitHub's default heading font, blue
// underlined links and a table with an empty header band sitting directly under
// the styled cards. Markdown can't be restyled, so the section is drawn instead
// — one SVG per row, each wrapped in its own <a> in the README so every repo
// stays clickable.
import { MONO, SANS, CH, esc, r2, fadeIn, riseIn, svgWrap } from '../lib/core.mjs';

const W = 880;
const PAD = 26;

/* --------------------------------------------------------------- heading */
export function sectionHeading(text, t) {
  const H = 44;
  const body = `
<rect x="${PAD}" y="${H / 2 - 1.5}" width="0" height="3" rx="1.5" fill="${t.accent}">
  <animate attributeName="width" values="0;22" dur="0.5s" begin="0.1s" fill="freeze"
           calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1"/>
</rect>
<text x="${PAD + 34}" y="${H / 2 + 4.5}" font-family="${MONO}" font-size="13"
      letter-spacing="1.2" fill="${t.dim}" opacity="0">${esc(text)}${fadeIn(0.25, 0.4)}</text>
`;
  return svgWrap({ w: W, h: H, title: text, body });
}

/* ------------------------------------------------------------- work rows */
export function workRow(item, t, i = 0) {
  const H = 58;
  const nameFS = 13.5;
  const descX = PAD + 190;
  const begin = 0.1 + i * 0.05;
  const mid = H / 2;

  const body = `
<g opacity="0">${fadeIn(begin, 0.45)}
<g>${riseIn(6, begin, 0.55)}
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="11"
        fill="${t.panel}" stroke="${t.border}" stroke-width="1.5"/>
  <rect x="1" y="14" width="3" height="${H - 28}" rx="1.5" fill="${t.accent}" opacity="0.9"/>
  <text x="${PAD}" y="${mid + 4.5}" font-family="${MONO}" font-size="${nameFS}"
        font-weight="600" fill="${t.accent}">${esc(item.repo)}</text>
  <text x="${descX}" y="${mid + 4.5}" font-family="${SANS}" font-size="13.5"
        fill="${t.dim}">${esc(item.desc)}</text>
  <path d="M${W - PAD - 5} ${mid - 5} L${W - PAD} ${mid} L${W - PAD - 5} ${mid + 5}"
        fill="none" stroke="${t.faint}" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round"/>
</g></g>
`;
  return svgWrap({
    w: W,
    h: H,
    title: `${item.repo} — ${item.desc}`,
    body,
  });
}

/* --------------------------------------------------------- contact chips */
export function contactChip(item, t, i = 0) {
  const FS = 12.5;
  const advance = FS * CH;
  const H = 34;
  const textX = 30;
  const w = Math.round(textX + item.label.length * advance + 16);
  const begin = 0.1 + i * 0.08;

  const body = `
<g opacity="0">${fadeIn(begin, 0.45)}
  <rect x="0.75" y="0.75" width="${w - 1.5}" height="${H - 1.5}" rx="${(H - 1.5) / 2}"
        fill="${t.panelAlt}" stroke="${t.border}" stroke-width="1.5"/>
  <circle cx="17" cy="${H / 2}" r="3.75" fill="${item.color}"/>
  <text x="${textX}" y="${H / 2 + 4.2}" font-family="${MONO}" font-size="${FS}"
        fill="${t.text}">${esc(item.label)}</text>
</g>
`;
  return svgWrap({ w, h: H, title: item.label, body });
}

// Filesystem-safe id for an asset name.
export const slug = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
