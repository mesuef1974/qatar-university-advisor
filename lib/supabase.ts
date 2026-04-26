/**
 * Supabase Client — Qatar University Advisor (TypeScript)
 * ═══════════════════════════════════════════
 * PostgreSQL database via Supabase (Free Tier: 50K MAU)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseCircuit, STATES } from './circuit-breaker';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

/** Row returned from the `users` table */
export interface UserRow {
  id: string;
  phone: string;
  nationality: string | null;
  user_type: string | null;
  track: string | null;
  gpa: number | string | null;
  conversation_stage: string | null;
  profile_data: Record<string, unknown> | null;
  last_seen_at: string | null;
  deletion_requested?: boolean;
  deletion_requested_at?: string | null;
}

/** Row returned from the `conversations` table */
export interface ConversationRow {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

/** Shape of the profile_data JSONB column, used for merged profile reads */
export interface ProfileData {
  nationality?: string;
  userType?: string;
  track?: string;
  gpa?: number;
  conversationStage?: string;
  preferredMajor?: string;
  messageCount?: number;
  [key: string]: unknown;
}

/** Row returned from the `analytics` table */
export interface AnalyticsRow {
  id: string;
  query: string;
  matched_key: string | null;
  source: string;
}

/** Row returned from the `favorites` table */
export interface FavoriteRow {
  university_id: string;
  added_at: string;
}

/** Migration 006 — extra fields on universities (all nullable until ETL fills them) */
export interface UniversityEnrichmentRow {
  application_deadline: string | null;
  application_open_date: string | null;
  apply_url: string | null;
  logo_url: string | null;
  qs_world_rank: number | null;
  qs_arab_rank: number | null;
  student_count: number | null;
  language_requirements: Record<string, unknown> | null;
  last_verified_at: string | null;
  verified_by: string | null;
}

/** Migration 006 — program_career_paths join table */
export interface ProgramCareerPathRow {
  id: number;
  program_id: number;
  career_id: number;
  fit_score: number;
  rationale_ar: string | null;
  curated_by: string | null;
  curated_at: string;
}

/** Migration 006 — knowledge_versions audit log */
export interface KnowledgeVersionRow {
  id: number;
  table_name: string;
  row_pk: string;
  snapshot: Record<string, unknown>;
  change_type: 'insert' | 'update' | 'delete';
  source: string | null;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
}

/** Query count tuple */
export interface QueryCount {
  key: string;
  count: number;
}

/** Basic stats object */
export interface Stats {
  totalUsers: number;
  totalMessages: number;
  totalQueries: number;
}

/** Partial updates to a user row */
export type UserProfileUpdate = Partial<
  Pick<UserRow, 'nationality' | 'user_type' | 'track' | 'gpa' | 'conversation_stage'> & {
    deletion_requested?: boolean;
    deletion_requested_at?: string;
  }
>;

// ──────────────────────────────────────────────────────────
// Client initialization
// ──────────────────────────────────────────────────────────
//
// SECURITY (DEC-SEC-002 / RLS hotfix 2026-04-10):
// This module is SERVER-ONLY. It uses SUPABASE_SERVICE_ROLE_KEY which
// bypasses Row-Level Security. It must NEVER be imported from a client
// component, page, or any code that runs in the browser.
//
// - Do NOT prefix the env var with NEXT_PUBLIC_* — that would ship the
//   service role key to the browser bundle.
// - Do NOT use the anon key for backend writes. After migration 003
//   (USING(TRUE) → strict RLS), anon key can no longer read/write on
//   behalf of the backend.
// - All writes/reads performed by webhook handlers, cron jobs, admin
//   routes, and health checks go through this client.
// ──────────────────────────────────────────────────────────

const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey: string =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Returns a server-only Supabase client that uses the SERVICE_ROLE_KEY
 * and therefore bypasses RLS. Throws loudly if the required env vars are
 * missing, so misconfiguration is caught at call time instead of silently
 * degrading.
 *
 * SECURITY: Never import or call this from client components.
 * Reference: DEC-SEC-002 (RLS hotfix 2026-04-10).
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. ' +
        'Ensure SUPABASE_SERVICE_ROLE_KEY is set in Vercel (server-side only, ' +
        'without NEXT_PUBLIC_ prefix). See DEPLOY_RLS_HOTFIX_STEPS.md.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Backward-compat singleton. Existing modules
// (lib/consent-manager.js, lib/knowledge-base.js, lib/semantic-search.js,
//  api-legacy/admin.js, src/app/api/admin/route.ts, tests) import `supabase`
// directly and gracefully handle a null client when env vars are missing.
// We preserve that behavior while switching the key to SERVICE_ROLE_KEY.
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// ──────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────

/** Circuit breaker state type from circuit-breaker.js */
interface CircuitBreakerModule {
  state: string;
  execute: <T>(fn: () => Promise<T>, fallback: () => T) => Promise<T>;
}

/**
 * Check if Supabase is configured and available
 */
function isSupabaseAvailable(): boolean {
  return supabase !== null && (supabaseCircuit as CircuitBreakerModule).state !== STATES.OPEN;
}

/**
 * T-010: Helper — executes any Supabase query with Circuit Breaker
 */
async function _withCB<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return (supabaseCircuit as CircuitBreakerModule).execute(fn, () => fallback);
}

// ──────────────────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────────────────

/**
 * Get or create a user by phone number
 * Returns full user row including profile_data JSONB
 */
async function getOrCreateUser(phone: string, nationality: string | null = null): Promise<UserRow | null> {
  if (!supabase) return null;

  return _withCB(async () => {
    // Try to find existing user
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existing) {
      // Update last_seen_at on every visit (fire & forget)
      supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('phone', phone)
        .then(() => {}, () => {});
      return existing as UserRow;
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ phone, nationality, last_seen_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newUser as UserRow;
  }, null);
}

/**
 * Update user profile fields (nationality, track, gpa, conversation_stage, etc.)
 */
async function updateUserProfile(phone: string, updates: UserProfileUpdate): Promise<UserRow | null> {
  if (!supabase) return null;

  return _withCB(async () => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('phone', phone)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as UserRow;
  }, null);
}

/**
 * T-009: Save full profile object to profile_data JSONB column
 */
async function saveUserProfileData(phone: string, profileData: ProfileData): Promise<{ id: string } | null> {
  if (!supabase || !phone) return null;

  return _withCB(async () => {
    const { data, error } = await supabase
      .from('users')
      .update({
        profile_data: profileData,
        // Sync key fields to dedicated columns for easy querying
        nationality: profileData.nationality || null,
        user_type: profileData.userType || null,
        track: profileData.track || null,
        gpa: profileData.gpa || null,
        conversation_stage: profileData.conversationStage || 'STAGE_0',
        last_seen_at: new Date().toISOString(),
      })
      .eq('phone', phone)
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data as { id: string };
  }, null);
}

/**
 * T-009: Load full profile object from profile_data JSONB column
 */
async function getUserProfileData(phone: string): Promise<ProfileData> {
  if (!supabase || !phone) return {};

  return _withCB(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('profile_data, nationality, user_type, track, gpa, conversation_stage')
      .eq('phone', phone)
      .single();

    if (error || !data) return {};

    // Merge profile_data JSONB with dedicated columns (columns take precedence)
    const profileRow = data as {
      profile_data: ProfileData | null;
      nationality: string | null;
      user_type: string | null;
      track: string | null;
      gpa: string | number | null;
      conversation_stage: string | null;
    };

    const merged: ProfileData = { ...(profileRow.profile_data || {}) };
    if (profileRow.nationality && profileRow.nationality !== 'unknown') merged.nationality = profileRow.nationality;
    if (profileRow.user_type && profileRow.user_type !== 'GENERAL') merged.userType = profileRow.user_type;
    if (profileRow.track) merged.track = profileRow.track;
    if (profileRow.gpa) merged.gpa = parseFloat(String(profileRow.gpa));
    if (profileRow.conversation_stage) merged.conversationStage = profileRow.conversation_stage;

    return merged;
  }, {}); // Fallback = empty object
}

// ──────────────────────────────────────────────────────────
// Conversations (last 10 messages per user)
// ──────────────────────────────────────────────────────────

/**
 * Save a message to conversation history
 */
async function saveMessage(userId: string, role: 'user' | 'assistant', message: string): Promise<void> {
  if (!supabase || !userId) return;

  // Fire & forget with Circuit Breaker
  _withCB(async () => {
    await supabase.from('conversations').insert({ user_id: userId, role, message });

    // Keep only last 10 messages per user
    const { data: messages } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (messages && messages.length > 10) {
      const idsToDelete: string[] = messages.slice(10).map((m: { id: string }) => m.id);
      await supabase.from('conversations').delete().in('id', idsToDelete);
    }
  }, undefined).catch(() => {}); // always silent fail
}

/**
 * Get conversation history for a user
 */
async function getConversationHistory(
  userId: string,
): Promise<Array<{ role: string; message: string; created_at: string }>> {
  if (!supabase || !userId) return [];

  return _withCB(async () => {
    const { data } = await supabase
      .from('conversations')
      .select('role, message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10);

    return (data || []) as Array<{ role: string; message: string; created_at: string }>;
  }, []);
}

// ──────────────────────────────────────────────────────────
// Analytics (what do users ask?)
// ──────────────────────────────────────────────────────────

/**
 * Log a user query for analytics
 */
async function logQuery(query: string, matchedKey: string | null, source: string = 'whatsapp'): Promise<void> {
  if (!supabase) return;

  try {
    await supabase
      .from('analytics')
      .insert({ query, matched_key: matchedKey, source });
  } catch {
    // Silent fail
  }
}

/**
 * Get top queries (for admin dashboard)
 *
 * Fetches at most 10_000 recent rows from `analytics` to avoid loading the
 * entire table into memory, then aggregates counts in JavaScript. For larger
 * datasets a dedicated Postgres view / RPC function should be used instead.
 */
async function getTopQueries(limit: number = 20): Promise<QueryCount[]> {
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from('analytics')
      .select('matched_key')
      .not('matched_key', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10_000);

    if (!data) return [];

    // Count occurrences
    const counts: Record<string, number> = {};
    (data as Array<{ matched_key: string }>).forEach((row) => {
      counts[row.matched_key] = (counts[row.matched_key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }));
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// Favorites
// ──────────────────────────────────────────────────────────

/**
 * Add a university to favorites
 */
async function addFavorite(userId: string, universityId: string): Promise<void> {
  if (!supabase || !userId) return;

  try {
    await supabase
      .from('favorites')
      .upsert({ user_id: userId, university_id: universityId });
  } catch {
    // Silent fail
  }
}

/**
 * Remove a university from favorites
 */
async function removeFavorite(userId: string, universityId: string): Promise<void> {
  if (!supabase || !userId) return;

  try {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('university_id', universityId);
  } catch {
    // Silent fail
  }
}

/**
 * Get user's favorite universities
 */
async function getFavorites(userId: string): Promise<FavoriteRow[]> {
  if (!supabase || !userId) return [];

  try {
    const { data } = await supabase
      .from('favorites')
      .select('university_id, added_at')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    return (data || []) as FavoriteRow[];
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// Stats (for admin)
// ──────────────────────────────────────────────────────────

/**
 * Get basic stats
 */
async function getStats(): Promise<Stats | null> {
  if (!supabase) return null;

  try {
    const [users, conversations, analytics] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('conversations').select('id', { count: 'exact', head: true }),
      supabase.from('analytics').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: users.count || 0,
      totalMessages: conversations.count || 0,
      totalQueries: analytics.count || 0,
    };
  } catch {
    return null;
  }
}

export {
  supabase,
  isSupabaseAvailable,
  getOrCreateUser,
  updateUserProfile,
  saveUserProfileData,
  getUserProfileData,
  saveMessage,
  getConversationHistory,
  logQuery,
  getTopQueries,
  addFavorite,
  removeFavorite,
  getFavorites,
  getStats,
};
