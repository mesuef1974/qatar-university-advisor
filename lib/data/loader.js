/**
 * University Data Loader
 * Reads from data/universities.json and exports the same interface
 * as universities-2026.js so existing code doesn't break.
 *
 * New functions:
 *   - getLastUpdated(universityId) — returns the lastUpdated date for a university
 *   - getDataFreshness()           — returns how old the data is in days
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Resolve path to universities.json ────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const DATA_PATH  = join(__dirname, '..', '..', 'data', 'universities.json');

// ── Load and parse ───────────────────────────────────────────
let _raw;
try {
  _raw = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
} catch (err) {
  console.error(`[loader] Failed to load university data from ${DATA_PATH}:`, err.message);
  throw err;
}

// ── Strip the per-record metadata so the shape matches the old module ──
function stripMeta(record) {
  const { lastUpdated, dataSource, academicYear, ...rest } = record;
  return rest;
}

// ── Exported constants (same names as universities-2026.js) ──

/** Universities keyed by ID (QU, CMU_Q, TAMU_Q, ...) */
export const UNIVERSITIES_2026 = Object.fromEntries(
  Object.entries(_raw.universities).map(([id, data]) => [id, stripMeta(data)]),
);

/** Government scholarships keyed by ID */
export const GOVERNMENT_SCHOLARSHIPS_2026 = Object.fromEntries(
  Object.entries(_raw.governmentScholarships).map(([id, data]) => [id, stripMeta(data)]),
);

/** Quick answers map (question -> answer) */
export const QUICK_ANSWERS_2026 = { ..._raw.quickAnswers };

// ── New helper functions ─────────────────────────────────────

/**
 * Get the lastUpdated date for a specific university.
 * @param {string} universityId - e.g. "QU", "CMU_Q"
 * @returns {string|null} ISO date string or null if not found
 */
export function getLastUpdated(universityId) {
  const entry = _raw.universities[universityId];
  return entry?.lastUpdated ?? null;
}

/**
 * Get data freshness — how many days old the most recent update is.
 * Checks all universities and scholarships, returns the *smallest* age
 * (i.e. the freshest record) plus the date it was last touched.
 *
 * @returns {{ days: number, lastUpdated: string, isStale: boolean }}
 *   - days:        number of full days since the newest lastUpdated
 *   - lastUpdated: the most recent lastUpdated date across all records
 *   - isStale:     true if the data is older than 90 days
 */
export function getDataFreshness() {
  const dates = [
    ...Object.values(_raw.universities).map((u) => u.lastUpdated),
    ...Object.values(_raw.governmentScholarships).map((s) => s.lastUpdated),
  ].filter(Boolean);

  if (dates.length === 0) {
    return { days: Infinity, lastUpdated: null, isStale: true };
  }

  // Most recent date across all records
  const newest = dates.sort().reverse()[0];
  const diff   = Date.now() - new Date(newest).getTime();
  const days   = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    days,
    lastUpdated: newest,
    isStale: days > 90,
  };
}

/**
 * Access the raw JSON data (including metadata fields).
 * Useful for admin/content dashboards.
 */
export function getRawData() {
  return _raw;
}
