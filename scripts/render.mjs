#!/usr/bin/env node
// Renders the two live README images from WakaTime data:
//   assets/stats.svg      purple stats band
//   assets/languages.svg  "Time spent" language panel
//
//   node scripts/render.mjs            → uses $WAKATIME_API_KEY, else cache
//   node scripts/render.mjs --offline  → always uses data/wakatime.json
import fs from 'node:fs';
import path from 'node:path';
import { getStats } from './lib/waka.mjs';
import { statsBand, languagePanel } from './designs/live.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'assets');
const offline = process.argv.includes('--offline');

const profile = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'profile.json'), 'utf8'));
const stats = await getStats({ apiKey: offline ? null : process.env.WAKATIME_API_KEY });

fs.mkdirSync(OUT, { recursive: true });
const files = {
  'stats.svg': statsBand(stats, profile),
  'languages.svg': languagePanel(stats),
};
for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), svg);
  console.log(`  assets/${name}  ${(svg.length / 1024).toFixed(1)} kB`);
}
console.log(`\n✔ ${stats.total} · top: ${stats.languages[0]?.name}`);
