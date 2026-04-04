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
  return supabase !== null;
}

// ═══════════════════════════════════════════
// Users
// ═══════════════════════════════════════════

/**
 * Get or create a user by phone number
 */
async function getOrCreateUser(phone, nationality = null) {
  if (!supabase) return null;

  try {
    // Try to find existing user
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existing) return existing;

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ phone, nationality })
      .select()
      .single();

    if (error) {
      console.error('[supabase] Error creating user:', error.message);
      return null;
    }
    return newUser;
  } catch {
    return null;
  }
}

/**
 * Update user profile (grade, track, nationality)
 */
async function updateUserProfile(phone, updates) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('phone', phone)
      .select()
      .single();

    if (error) {
      console.error('[supabase] Error updating user:', error.message);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════
// Conversations (last 10 messages per user)
// ═══════════════════════════════════════════

/**
 * Save a message to conversation history
 */
async function saveMessage(userId, role, message) {
  if (!supabase || !userId) return;

  try {
    await supabase
      .from('conversations')
      .insert({ user_id: userId, role, message });

    // Keep only last 10 messages per user
    const { data: messages } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (messages && messages.length > 10) {
      const idsToDelete = messages.slice(10).map(m => m.id);
      await supabase
        .from('conversations')
        .delete()
        .in('id', idsToDelete);
    }
  } catch {
    // Silent fail — don't break the chat
  }
}

/**
 * Get conversation history for a user
 */
async function getConversationHistory(userId) {
  if (!supabase || !userId) return [];

  try {
    const { data } = await supabase
      .from('conversations')
      .select('role, message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10);

    return data || [];
  } catch {
    return [];
  }
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
  saveMessage,
  getConversationHistory,
  logQuery,
  getTopQueries,
  addFavorite,
  removeFavorite,
  getFavorites,
  getStats,
};
