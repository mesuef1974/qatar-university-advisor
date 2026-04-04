/* global process */

/**
 * Supabase Client — Qatar University Advisor
 * ═══════════════════════════════════════════
 * PostgreSQL database via Supabase (Free Tier: 50K MAU)
 *
 * Environment Variables (add to Vercel + .env.local):
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_ANON_KEY=eyJhbGciOi...
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseCircuit, STATES } from './circuit-breaker.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Create client only if credentials are available
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check if Supabase is configured and available
 */
function isSupabaseAvailable() {
  return supabase !== null && supabaseCircuit.state !== STATES.OPEN;
}

/**
 * T-010: Helper داخلي — ينفّذ أي Supabase query مع Circuit Breaker
 * @param {Function} fn - دالة تُرجع Promise
 * @param {any} fallback - قيمة عند الفشل
 */
async function _withCB(fn, fallback = null) {
  return supabaseCircuit.execute(fn, () => fallback);
}

// ═══════════════════════════════════════════
// Users
// ═══════════════════════════════════════════

/**
 * Get or create a user by phone number
 * Returns full user row including profile_data JSONB
 * T-010: محمي بـ Circuit Breaker
 */
async function getOrCreateUser(phone, nationality = null) {
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
      supabase.from('users').update({ last_seen_at: new Date().toISOString() })
        .eq('phone', phone).catch(() => {});
      return existing;
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ phone, nationality, last_seen_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newUser;
  }, null);
}

/**
 * Update user profile fields (nationality, track, gpa, conversation_stage, etc.)
 * T-010: محمي بـ Circuit Breaker
 */
async function updateUserProfile(phone, updates) {
  if (!supabase) return null;

  return _withCB(async () => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('phone', phone)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }, null);
}

/**
 * T-009: Save full profile object to profile_data JSONB column
 * T-010: محمي بـ Circuit Breaker
 * @param {string} phone
 * @param {object} profileData - full profile object
 */
async function saveUserProfileData(phone, profileData) {
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
    return data;
  }, null);
}

/**
 * T-009: Load full profile object from profile_data JSONB column
 * T-010: محمي بـ Circuit Breaker — يُرجع {} عند الفشل بدلاً من الكسر
 * @param {string} phone
 * @returns {object} profileData or {}
 */
async function getUserProfileData(phone) {
  if (!supabase || !phone) return {};

  return _withCB(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('profile_data, nationality, user_type, track, gpa, conversation_stage')
      .eq('phone', phone)
      .single();

    if (error || !data) return {};

    // Merge profile_data JSONB with dedicated columns (columns take precedence)
    const merged = { ...(data.profile_data || {}) };
    if (data.nationality && data.nationality !== 'unknown') merged.nationality = data.nationality;
    if (data.user_type && data.user_type !== 'GENERAL') merged.userType = data.user_type;
    if (data.track) merged.track = data.track;
    if (data.gpa) merged.gpa = parseFloat(data.gpa);
    if (data.conversation_stage) merged.conversationStage = data.conversation_stage;

    return merged;
  }, {}); // Fallback = ملف فارغ، البوت يبدأ من الصفر بدلاً من الكسر
}

// ═══════════════════════════════════════════
// Conversations (last 10 messages per user)
// ═══════════════════════════════════════════

/**
 * Save a message to conversation history
 * T-010: Silent fail — البوت لا يتوقف حتى لو فشل الحفظ
 */
async function saveMessage(userId, role, message) {
  if (!supabase || !userId) return;

  // Fire & forget مع Circuit Breaker — لا نُوقف المحادثة
  _withCB(async () => {
    await supabase.from('conversations').insert({ user_id: userId, role, message });

    // Keep only last 10 messages per user
    const { data: messages } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (messages && messages.length > 10) {
      const idsToDelete = messages.slice(10).map(m => m.id);
      await supabase.from('conversations').delete().in('id', idsToDelete);
    }
  }).catch(() => {}); // دائماً silent fail
}

/**
 * Get conversation history for a user
 * T-010: يُرجع [] إذا كان Supabase غير متاح
 */
async function getConversationHistory(userId) {
  if (!supabase || !userId) return [];

  return _withCB(async () => {
    const { data } = await supabase
      .from('conversations')
      .select('role, message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10);

    return data || [];
  }, []); // Fallback = تاريخ فارغ، يبدأ Gemini بدون سياق
}

// ═══════════════════════════════════════════
// Analytics (what do users ask?)
// ═══════════════════════════════════════════

/**
 * Log a user query for analytics
 */
async function logQuery(query, matchedKey, source = 'whatsapp') {
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
 */
async function getTopQueries(limit = 20) {
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from('analytics')
      .select('matched_key')
      .not('matched_key', 'is', null);

    if (!data) return [];

    // Count occurrences
    const counts = {};
    data.forEach(row => {
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

// ═══════════════════════════════════════════
// Favorites
// ═══════════════════════════════════════════

/**
 * Add a university to favorites
 */
async function addFavorite(userId, universityId) {
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
async function removeFavorite(userId, universityId) {
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
async function getFavorites(userId) {
  if (!supabase || !userId) return [];

  try {
    const { data } = await supabase
      .from('favorites')
      .select('university_id, added_at')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    return data || [];
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════
// Stats (for admin)
// ═══════════════════════════════════════════

/**
 * Get basic stats
 */
async function getStats() {
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
