// Grouped tech-stack chips — replaces the undifferentiated badge wall.
//
// Chip labels are monospace on purpose. SVG can't size a shape to its own text
// content, so the pill width has to be computed here — and with a proportional
// font that means guessing, which left "github actions" with a fat tail of dead
// space while "git" sat tight. A monospace advance is exactly 0.6em per glyph,
// so the padding is identical on every chip regardless of the label.
import { MONO, CH, esc, r2, fadeIn, riseIn, svgWrap } from '../lib/core.mjs';

const W = 880;
const PAD = 26;

const CHIP_FS = 12.5;
const ADVANCE = CHIP_FS * CH; // exact for any font in the MONO stack
const DOT_CX = 15; // dot centre, relative to chip left edge
const TEXT_X = 27; // text start, relative to chip left edge
const PAD_R = 15; // trailing space after the last glyph

export function stack(profile, t) {
  const labelX = PAD + 4;
  const chipsX = PAD + 150;
  const rowH = 46;
  const chipH = 28;

  const parts = [];
  let y = PAD + 16;
  let clock = 0.25;

  for (const group of profile.stack) {
    parts.push(
      `<text x="${labelX}" y="${y + chipH / 2 + 4}" fill="${t.faint}" ` +
        `font-family="${MONO}" font-size="11.5" letter-spacing="0.8" ` +
        `opacity="0">${esc(group.group.toLowerCase())}` +
        `${fadeIn(clock, 0.35)}</text>`
    );

    let x = chipsX;
    for (const item of group.items) {
      const label = item.name.toLowerCase();
      const textW = label.length * ADVANCE;
      const chipW = TEXT_X + textW + PAD_R;

      parts.push(
        `<g opacity="0">${fadeIn(clock, 0.4)}` +
          `<g>${riseIn(6, clock, 0.5)}` +
          `<rect x="${r2(x)}" y="${y}" width="${r2(chipW)}" height="${chipH}" ` +
          `rx="${chipH / 2}" fill="${t.panelAlt}" stroke="${t.border}" stroke-width="1"/>` +
          `<circle cx="${r2(x + DOT_CX)}" cy="${y + chipH / 2}" r="3.75" fill="${item.color}"/>` +
          `<text x="${r2(x + TEXT_X)}" y="${y + chipH / 2 + 4.2}" fill="${t.text}" ` +
          `font-family="${MONO}" font-size="${CHIP_FS}" ` +
          `letter-spacing="0">${esc(label)}</text>` +
          `</g></g>`
      );

      x += chipW + 9;
      clock += 0.07;
    }

    // Rows don't wrap, so warn loudly rather than silently clipping a chip the
    // next time an item gets added to profile.json.
    if (x - 9 > W - PAD) {
      console.warn(
        `  ! stack row "${group.group}" overflows by ${Math.ceil(x - 9 - (W - PAD))}px ` +
          `— drop an item or shorten a label`
      );
    }

    y += rowH;
    clock += 0.06;
  }

  const H = Math.round(y + PAD - 12);

  const body = `
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="13"
      fill="${t.panel}" stroke="${t.border}" stroke-width="1.5"/>
${parts.join('\n')}
`;

  return svgWrap({
    w: W,
    h: H,
    title: 'tech stack',
    desc: profile.stack
      .map((g) => `${g.group}: ${g.items.map((i) => i.name).join(', ')}`)
      .join('. '), // accessible text keeps proper casing
    body,
  });
}
