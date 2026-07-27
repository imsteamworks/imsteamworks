// Fetches all-time WakaTime stats. Falls back to the committed snapshot in
// data/wakatime.json when no API key is present, so local renders and forks
// still produce a complete profile.
import fs from 'node:fs';
import path from 'node:path';

const CACHE = path.join(process.cwd(), 'data', 'wakatime.json');
const MAX_LANGS = 6;

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export async function getStats({ apiKey, write = true } = {}) {
  if (!apiKey) {
    console.log('· no WAKATIME_API_KEY — using cached data/wakatime.json');
    return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  }

  const auth = Buffer.from(apiKey).toString('base64');
  const res = await fetch(
    'https://wakatime.com/api/v1/users/current/stats/all_time',
    { headers: { Authorization: `Basic ${auth}` } }
  );

  if (!res.ok) {
    console.warn(`· WakaTime API ${res.status} — falling back to cache`);
    return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  }

  const { data } = await res.json();

  const languages = (data.languages || [])
    .filter((l) => l.percent > 0)
    .slice(0, MAX_LANGS)
    .map((l) => ({
      name: l.name,
      text: l.text,
      percent: Math.round(l.percent * 100) / 100,
    }));

  const stats = {
    total: data.human_readable_total || data.text,
    start: fmtDate(data.start || data.range?.start),
    end: fmtDate(data.end || data.range?.end),
    languages,
  };

  if (write) fs.writeFileSync(CACHE, JSON.stringify(stats, null, 2) + '\n');
  return stats;
}
