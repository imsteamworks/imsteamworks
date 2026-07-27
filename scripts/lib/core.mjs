// Shared helpers: palettes, language colors, SVG utilities.

export const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace";
export const SANS =
  "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif";

// Monospace advance width is a fixed ratio of the font size for every font in
// the MONO stack, so character-accurate typewriter timing is just arithmetic.
export const CH = 0.6;

export const THEMES = {
  dark: {
    id: 'dark',
    bg: '#0B0F16',
    panel: '#0E1420',
    panelAlt: '#121A28',
    border: '#1E2A3C',
    text: '#E6EDF3',
    dim: '#7D8DA3',
    faint: '#4A5768',
    accent: '#7C6AF0',
    accent2: '#22D3EE',
    green: '#3FB950',
    track: '#1A2434',
    glow: 0.55,
  },
  light: {
    id: 'light',
    bg: '#FFFFFF',
    panel: '#FBFCFE',
    panelAlt: '#F3F6FA',
    border: '#DCE3EC',
    text: '#111826',
    dim: '#5A6879',
    faint: '#95A1B1',
    accent: '#5B4BD6',
    accent2: '#0E93AE',
    green: '#1A7F37',
    track: '#E8ECF3',
    glow: 0.28,
  },
};

// GitHub linguist colours, so the bars read as the languages themselves.
export const LANG_COLORS = {
  Java: '#B07219',
  Kotlin: '#A97BFF',
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  YAML: '#CB171E',
  XML: '#0060AC',
  JSON: '#40D47E',
  Python: '#3572A5',
  Rust: '#DEA584',
  Go: '#00ADD8',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Markdown: '#083FA1',
  Bash: '#89E051',
  Shell: '#89E051',
  Groovy: '#4298B8',
  SQL: '#E38C00',
  Other: '#8B949E',
};

export const langColor = (name) => LANG_COLORS[name] || '#8B949E';

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Per-character reveal keyframes for a monospace string.
 * calcMode="discrete" makes the clip rect jump one glyph at a time, which is a
 * real typewriter rather than a smooth wipe.
 */
export function typeAnim(chars, width, begin, cps = 26) {
  const steps = Math.max(chars, 1);
  const dur = steps / cps;
  const values = [];
  const keyTimes = [];
  for (let i = 0; i <= steps; i++) {
    values.push(r2((width * i) / steps));
    keyTimes.push(r2(i / steps));
  }
  return {
    dur,
    end: begin + dur,
    xml:
      `<animate attributeName="width" calcMode="discrete" ` +
      `values="${values.join(';')}" keyTimes="${keyTimes.join(';')}" ` +
      `dur="${r2(dur)}s" begin="${r2(begin)}s" fill="freeze"/>`,
  };
}

// Ease-out growth for bars — linear growth looks mechanical.
export function growAnim(width, begin, dur = 0.75) {
  return (
    `<animate attributeName="width" values="0;${r2(width)}" ` +
    `dur="${dur}s" begin="${r2(begin)}s" fill="freeze" ` +
    `calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1"/>`
  );
}

export function fadeIn(begin, dur = 0.45, to = 1) {
  return (
    `<animate attributeName="opacity" values="0;${to}" dur="${dur}s" ` +
    `begin="${r2(begin)}s" fill="freeze" calcMode="spline" ` +
    `keyTimes="0;1" keySplines="0.2 0.8 0.2 1"/>`
  );
}

export function riseIn(dy, begin, dur = 0.6) {
  return (
    `<animate attributeName="transform" type="translate" ` +
    `values="0 ${dy};0 0" dur="${dur}s" begin="${r2(begin)}s" fill="freeze" ` +
    `calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" ` +
    `attributeType="XML" additive="sum"/>`
  );
}

export function svgWrap({ w, h, title, body, desc = '' }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
    `viewBox="0 0 ${w} ${h}" fill="none" role="img" ` +
    `aria-label="${esc(title)}">\n` +
    `<title>${esc(title)}</title>\n` +
    (desc ? `<desc>${esc(desc)}</desc>\n` : '') +
    body +
    `\n</svg>\n`
  );
}
