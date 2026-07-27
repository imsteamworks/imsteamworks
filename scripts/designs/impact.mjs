// Design B — "impact": animated gradient hero, KPI cards, stacked language bar.
import {
  MONO, SANS, CH, esc, r2, growAnim, fadeIn, riseIn, svgWrap, langColor,
} from '../lib/core.mjs';

const W = 880;
const PAD = 26;

// keyTimes must be strictly increasing for linear interpolation; nudge any
// duplicates produced by the cycle maths.
function monotone(times) {
  const eps = 0.0015;
  const out = [];
  for (let i = 0; i < times.length; i++) {
    let v = times[i];
    if (i > 0 && v <= out[i - 1]) v = out[i - 1] + eps;
    out.push(Math.min(v, 1));
  }
  // guarantee the tail still ends at 1
  out[out.length - 1] = 1;
  return out.map(r2);
}

/* ------------------------------------------------------------------ hero */
export function hero(profile, t) {
  const H = 236;
  const cx = W / 2;
  const roles = profile.roles;
  const D = roles.length * 3.4;
  const subFS = 14;
  const subCHW = subFS * CH;

  const cycles = roles
    .map((role, i) => {
      const slot = 1 / roles.length;
      const a = i * slot;
      const b = (i + 1) * slot;
      const f = slot * 0.14;
      const kt = monotone([0, a, a + f, b - f, b, 1]);
      const w = role.length * subCHW;
      const x = cx - w / 2;
      const anim =
        `<animate attributeName="opacity" values="0;0;1;1;0;0" ` +
        `keyTimes="${kt.join(';')}" dur="${D}s" begin="0s" repeatCount="indefinite"/>`;
      return (
        `<g opacity="0">${anim}` +
        `<text x="${r2(x)}" y="153" fill="${t.dim}" font-family="${MONO}" ` +
        `font-size="${subFS}" letter-spacing="0.2">${esc(role)}</text>` +
        `<rect x="${r2(x + w + 6)}" y="141" width="${r2(subCHW * 0.85)}" height="15" ` +
        `fill="${t.accent}"/></g>`
      );
    })
    .join('\n');

  const body = `
<defs>
  <clipPath id="frame">
    <rect x="0" y="0" width="${W}" height="${H}" rx="14"/>
  </clipPath>
  <radialGradient id="b1" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${t.accent}" stop-opacity="${r2(t.glow)}"/>
    <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="b2" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${t.accent2}" stop-opacity="${r2(t.glow * 0.8)}"/>
    <stop offset="1" stop-color="${t.accent2}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="wm" x1="0" y1="0" x2="1" y2="0.6">
    <stop offset="0" stop-color="${t.accent}"/>
    <stop offset="0.55" stop-color="${t.text}"/>
    <stop offset="1" stop-color="${t.accent2}"/>
  </linearGradient>
  <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#ffffff" stop-opacity="${t.id === 'light' ? 0.55 : 0.8}"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
    <path d="M26 0 H0 V26" fill="none" stroke="${t.border}" stroke-width="1"/>
  </pattern>
  <mask id="gridfade">
    <rect width="${W}" height="${H}" fill="url(#gridgrad)"/>
  </mask>
  <linearGradient id="gridgrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.85"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <mask id="wordmask">
    <text x="${cx}" y="112" fill="#ffffff" font-family="${SANS}" font-size="62"
          font-weight="800" letter-spacing="7" text-anchor="middle">${esc(profile.wordmark)}</text>
  </mask>
  <clipPath id="reveal">
    <rect x="0" y="0" width="0" height="${H}">
      <animate attributeName="width" values="0;${W}" dur="1.1s" begin="0.15s"
               fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1"/>
    </rect>
  </clipPath>
</defs>

<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  <circle cx="190" cy="60" r="240" fill="url(#b1)">
    <animate attributeName="cx" values="190;330;190" dur="17s" repeatCount="indefinite"
             calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
    <animate attributeName="cy" values="60;150;60" dur="23s" repeatCount="indefinite"
             calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
  </circle>
  <circle cx="700" cy="190" r="250" fill="url(#b2)">
    <animate attributeName="cx" values="700;560;700" dur="19s" repeatCount="indefinite"
             calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
    <animate attributeName="cy" values="190;70;190" dur="15s" repeatCount="indefinite"
             calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
  </circle>
  <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridfade)"
        opacity="${t.id === 'light' ? 0.9 : 0.55}"/>

  <g clip-path="url(#reveal)">
    <g mask="url(#wordmask)">
      <rect x="0" y="40" width="${W}" height="100" fill="url(#wm)"/>
      <rect x="-320" y="40" width="320" height="100" fill="url(#shine)">
        <animate attributeName="x" values="-320;${W}" dur="2.6s" begin="1.2s;wmshine.end+5s"
                 id="wmshine" fill="freeze"/>
      </rect>
    </g>
  </g>

  ${cycles}

  <g opacity="0">${fadeIn(1.5, 0.6)}
    <line x1="${cx - 120}" y1="182" x2="${cx + 120}" y2="182"
          stroke="${t.border}" stroke-width="1"/>
    <text x="${cx}" y="207" fill="${t.faint}" font-family="${MONO}" font-size="11.5"
          text-anchor="middle" letter-spacing="0.6">${esc(profile.meta)}</text>
  </g>
</g>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="14"
      fill="none" stroke="${t.border}" stroke-width="1.5"/>
`;

  return svgWrap({
    w: W,
    h: H,
    title: `${profile.wordmark} — ${roles.join(', ')}`,
    body,
  });
}

/* ----------------------------------------------------------------- cards */
export function cards(stats, profile, t) {
  const H = 116;
  const gap = 14;
  const cw = (W - PAD * 2 - gap * 2) / 3;
  const top = stats.languages[0] || { name: '—', percent: 0 };

  // Total years writing code — set in profile.json. This is deliberately not
  // derived from the WakaTime start date: tracking began years after he did.
  const years = profile.yearsCoding;
  const hours = String(stats.total).match(/[\d,]+/)?.[0] || '0';

  const items = [
    { value: hours, unit: 'hrs', label: 'tracked, all-time', color: t.accent },
    {
      value: top.percent.toFixed(1),
      unit: '%',
      label: top.name.toLowerCase(),
      color: langColor(top.name),
    },
    { value: String(years), unit: 'yrs', label: 'writing code', color: t.accent2 },
  ];

  const parts = items
    .map((it, i) => {
      const x = PAD + i * (cw + gap);
      const begin = 0.2 + i * 0.13;
      return (
        `<g opacity="0">${fadeIn(begin, 0.5)}` +
        `<g>${riseIn(10, begin, 0.65)}` +
        `<rect x="${r2(x)}" y="0.75" width="${r2(cw)}" height="${H - 1.5}" rx="12" ` +
        `fill="${t.panel}" stroke="${t.border}" stroke-width="1.5"/>` +
        `<rect x="${r2(x + 20)}" y="26" width="0" height="2.5" rx="1.25" fill="${it.color}">` +
        `${growAnim(28, begin + 0.25, 0.6)}</rect>` +
        `<text x="${r2(x + 20)}" y="72" font-family="${SANS}" font-size="34" ` +
        `font-weight="700" fill="${t.text}" letter-spacing="-0.5">${esc(it.value)}` +
        `<tspan font-size="16" font-weight="600" fill="${t.dim}" dx="5">${esc(it.unit)}</tspan>` +
        `</text>` +
        `<text x="${r2(x + 20)}" y="94" font-family="${MONO}" font-size="11.5" ` +
        `fill="${t.faint}" letter-spacing="0.5">${esc(it.label)}</text>` +
        `</g></g>`
      );
    })
    .join('\n');

  return svgWrap({
    w: W,
    h: H,
    title: `${stats.total} tracked · ${top.percent}% ${top.name} · ${years} years`,
    body: parts,
  });
}

/* ----------------------------------------------------------------- langs */
export function langs(stats, t) {
  const barY = 62;
  const barH = 18;
  const barW = W - PAD * 2;
  const cols = 3;
  const rows = Math.ceil(stats.languages.length / cols);
  const H = barY + barH + 34 + rows * 38 + 12;

  let offset = 0;
  const segs = stats.languages
    .map((l, i) => {
      const w = (l.percent / 100) * barW;
      const x = PAD + offset;
      offset += w;
      return (
        `<rect x="${r2(x)}" y="${barY}" width="0" height="${barH}" ` +
        `fill="${langColor(l.name)}">${growAnim(Math.max(w, 2), 0.35 + i * 0.09, 0.9)}</rect>`
      );
    })
    .join('\n');

  const legend = stats.languages
    .map((l, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = PAD + col * (barW / cols);
      const y = barY + barH + 46 + row * 38;
      return (
        `<g opacity="0">${fadeIn(0.8 + i * 0.07, 0.4)}` +
        `<circle cx="${r2(x + 5)}" cy="${y - 4}" r="5" fill="${langColor(l.name)}"/>` +
        `<text x="${r2(x + 18)}" y="${y}" font-family="${SANS}" font-size="13.5" ` +
        `fill="${t.text}" font-weight="500">${esc(l.name.toLowerCase())}</text>` +
        `<text x="${r2(x + barW / cols - 22)}" y="${y}" font-family="${MONO}" ` +
        `font-size="12.5" fill="${t.dim}" text-anchor="end">${l.percent.toFixed(2)}%</text>` +
        `<text x="${r2(x + 18)}" y="${y + 15}" font-family="${MONO}" font-size="10.5" ` +
        `fill="${t.faint}">${esc(l.text)}</text></g>`
      );
    })
    .join('\n');

  const body = `
<defs>
  <clipPath id="barclip">
    <rect x="${PAD}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}"/>
  </clipPath>
</defs>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="13"
      fill="${t.panel}" stroke="${t.border}" stroke-width="1.5"/>
<text x="${PAD}" y="38" font-family="${MONO}" font-size="12.5" fill="${t.dim}"
      letter-spacing="0.4" opacity="0">${esc(stats.total.toLowerCase())}${fadeIn(0.2, 0.4)}</text>
<text x="${W - PAD}" y="38" font-family="${MONO}" font-size="12.5" fill="${t.faint}"
      text-anchor="end" letter-spacing="0.4" opacity="0">${esc(
        'since ' + String(stats.start).toLowerCase()
      )}${fadeIn(0.3, 0.4)}</text>
<rect x="${PAD}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="${t.track}"/>
<g clip-path="url(#barclip)">${segs}</g>
${legend}
`;

  return svgWrap({
    w: W,
    h: Math.round(H),
    title: 'all-time language breakdown',
    desc: stats.languages.map((l) => `${l.name} ${l.percent}%`).join(', '),
    body,
  });
}
