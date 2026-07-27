#!/usr/bin/env node
// Renders every profile SVG (dark + light) from live WakaTime data.
//   node scripts/render.mjs            → uses $WAKATIME_API_KEY, else cache
//   node scripts/render.mjs --offline  → always uses data/wakatime.json
import fs from 'node:fs';
import path from 'node:path';
import { THEMES } from './lib/core.mjs';
import { getStats } from './lib/waka.mjs';
import { terminal } from './designs/terminal.mjs';
import { stack } from './designs/stack.mjs';
import { hero, cards, langs } from './designs/impact.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'assets');
const offline = process.argv.includes('--offline');

const profile = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'profile.json'), 'utf8')
);
const stats = await getStats({
  apiKey: offline ? null : process.env.WAKATIME_API_KEY,
});

fs.mkdirSync(OUT, { recursive: true });

let written = 0;
for (const theme of Object.values(THEMES)) {
  const files = {
    // design A
    'terminal': terminal(stats, profile, theme),
    'stack': stack(profile, theme),
    // design B
    'hero': hero(profile, theme),
    'cards': cards(stats, profile, theme),
    'langs': langs(stats, theme),
  };

  for (const [name, svg] of Object.entries(files)) {
    const file = path.join(OUT, `${name}-${theme.id}.svg`);
    fs.writeFileSync(file, svg);
    written++;
    console.log(`  ${path.relative(ROOT, file)}  ${(svg.length / 1024).toFixed(1)} kB`);
  }
}

console.log(`\n✔ ${written} files · ${stats.total} · top: ${stats.languages[0]?.name}`);
