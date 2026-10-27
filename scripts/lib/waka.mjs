// Fetches all-time WakaTime stats. Falls back to the committed snapshot in
// data/wakatime.json when there's no API key or the API call fails, so local
// renders and forks still produce complete images.
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

const parseHours = (text = '') => {
  const h = /([\d,]+)\s*hr/.exec(text);
  const m = /(\d+)\s*min/.exec(text);
  return (h ? Number(h[1].replace(/,/g, '')) : 0) + (m ? Number(m[1]) / 60 : 0);
};

function readCache() {
  const c = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  return {
    ...c,
    totalHours: c.totalHours ?? parseHours(c.total),
    startISO: c.startISO ?? c.start,
    languages: c.languages.map((l) => ({ ...l, hours: l.hours ?? parseHours(l.text) })),
  };
}

export async function getStats({ apiKey, write = true } = {}) {
  if (!apiKey) {
    console.log('· no WAKATIME_API_KEY, using cached data/wakatime.json');
    return readCache();
  }

  const auth = Buffer.from(apiKey).toString('base64');
  const res = await fetch(
    'https://wakatime.com/api/v1/users/current/stats/all_time',
    { headers: { Authorization: `Basic ${auth}` } }
  );

  // 202 means WakaTime is still recalculating; its body can be empty or stale.
  if (res.status !== 200) {
    console.warn(`· WakaTime API ${res.status}, falling back to cache`);
    return readCache();
  }

  const { data } = await res.json();
  const hours = (s) => Math.round((s / 3600) * 100) / 100;

  const languages = (data.languages || [])
    .filter((l) => l.percent > 0)
    .slice(0, MAX_LANGS)
    .map((l) => ({
      name: l.name,
      text: l.text,
      percent: Math.round(l.percent * 100) / 100,
      hours: hours(l.total_seconds),
    }));

  if (!languages.length) {
    console.warn('· WakaTime returned no languages, falling back to cache');
    return readCache();
  }

  const startISO = data.start || data.range?.start;
  const stats = {
    total: data.human_readable_total || data.text,
    totalHours: hours(data.total_seconds),
    start: fmtDate(startISO),
    startISO,
    end: fmtDate(data.end || data.range?.end),
    languages,
  };

  if (write) fs.writeFileSync(CACHE, JSON.stringify(stats, null, 2) + '\n');
  return stats;
}
