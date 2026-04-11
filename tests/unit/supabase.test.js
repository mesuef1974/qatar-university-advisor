/**
 * Supabase Client — Unit Tests
 * QA-A1: رفع Test Coverage إلى 70%
 * azkia-qa | 2026-04-05
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock circuit breaker
vi.mock('../../lib/circuit-breaker.js', () => ({
  supabaseCircuit: {
    state: 'CLOSED',
    execute: vi.fn(async (fn, fallback) => {
      try { return await fn(); }
      catch { return fallback ? fallback() : null; }
    }),
  },
  STATES: { OPEN: 'OPEN', CLOSED: 'CLOSED', HALF_OPEN: 'HALF_OPEN' },
}));

// Mock @supabase/supabase-js
const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockSupabaseClient = { from: mockFrom, rpc: mockRpc };

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Set env vars before import
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

describe('Supabase Client', () => {
  let supabaseModule;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset module cache for fresh import each test
    supabaseModule = await import('../../lib/supabase.js');
  });

  // ═══════════════════════════════════════
  // isSupabaseAvailable
  // ═══════════════════════════════════════
  describe('isSupabaseAvailable()', () => {
    it('should return true when client is configured and circuit is closed', () => {
      expect(supabaseModule.isSupabaseAvailable()).toBe(true);
    });
  });

  // ═══════════════════════════════════════
  // getOrCreateUser
  // ═══════════════════════════════════════
  describe('getOrCreateUser()', () => {
    it('should return existing user if found', async () => {
      const existingUser = { id: 1, phone: '+974123', nationality: 'qatari' };
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: existingUser }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            then: vi.fn().mockReturnValue({ catch: vi.fn() }),
          }),
        }),
      });

      const result = await supabaseModule.getOrCreateUser('+974123');
      expect(result).toEqual(existingUser);
    });

    it('should create new user if not found', async () => {
      const newUser = { id: 2, phone: '+974456', nationality: 'non_qatari' };
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: newUser, error: null }),
          }),
        }),
      });

      const result = await supabaseModule.getOrCreateUser('+974456', 'non_qatari');
      expect(result).toEqual(newUser);
    });
  });

  // ═══════════════════════════════════════
  // updateUserProfile
  // ═══════════════════════════════════════
  describe('updateUserProfile()', () => {
    it('should update user profile fields', async () => {
      const updated = { id: 1, phone: '+974123', nationality: 'qatari', gpa: 95 };
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updated, error: null }),
            }),
          }),
        }),
      });

      const result = await supabaseModule.updateUserProfile('+974123', { gpa: 95 });
      expect(result).toEqual(updated);
    });
  });

  // ═══════════════════════════════════════
  // saveUserProfileData
  // ═══════════════════════════════════════
  describe('saveUserProfileData()', () => {
    it('should save profile data to JSONB column', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
            }),
          }),
        }),
      });

      const profileData = { nationality: 'qatari', userType: 'STUDENT', gpa: 90 };
      const result = await supabaseModule.saveUserProfileData('+974123', profileData);
      expect(result).toEqual({ id: 1 });
    });

    it('should return null if phone is empty', async () => {
      const result = await supabaseModule.saveUserProfileData('', {});
      expect(result).toBeNull();
    });
  });

  // ═══════════════════════════════════════
  // getUserProfileData
  // ═══════════════════════════════════════
  describe('getUserProfileData()', () => {
    it('should return merged profile data', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                profile_data: { interests: ['engineering'] },
                nationality: 'qatari',
                user_type: 'STUDENT',
                track: 'scientific',
                gpa: '92.5',
                conversation_stage: 'STAGE_2',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await supabaseModule.getUserProfileData('+974123');
      expect(result.nationality).toBe('qatari');
      expect(result.gpa).toBe(92.5);
      expect(result.interests).toEqual(['engineering']);
      expect(result.conversationStage).toBe('STAGE_2');
    });

    it('should return empty object if phone is empty', async () => {
      const result = await supabaseModule.getUserProfileData('');
      expect(result).toEqual({});
    });

    it('should return empty object on error', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          }),
        }),
      });

      const result = await supabaseModule.getUserProfileData('+974123');
      expect(result).toEqual({});
    });
  });

  // ═══════════════════════════════════════
  // saveMessage
  // ═══════════════════════════════════════
  describe('saveMessage()', () => {
    it('should not throw when saving a message', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [] }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({}),
        }),
      });

      // saveMessage is fire & forget, should not throw
      await expect(supabaseModule.saveMessage(1, 'user', 'hello')).resolves.not.toThrow();
    });

    it('should silently fail with null userId', async () => {
      await expect(supabaseModule.saveMessage(null, 'user', 'hello')).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════
  // getConversationHistory
  // ═══════════════════════════════════════
  describe('getConversationHistory()', () => {
    it('should return conversation messages', async () => {
      const messages = [
        { role: 'user', message: 'hello', created_at: '2026-01-01' },
        { role: 'assistant', message: 'hi', created_at: '2026-01-01' },
      ];
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: messages }),
            }),
          }),
        }),
      });

      const result = await supabaseModule.getConversationHistory(1);
      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('user');
    });

    it('should return empty array for null userId', async () => {
      const result = await supabaseModule.getConversationHistory(null);
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════
  // logQuery
  // ═══════════════════════════════════════
  describe('logQuery()', () => {
    it('should log a query silently', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: null }),
      });

      await expect(supabaseModule.logQuery('test query', 'test_key')).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════
  // getTopQueries
  // ═══════════════════════════════════════
  describe('getTopQueries()', () => {
    it('يستخدم RPC ويُرجع النتائج مرتبة', async () => {
      // RPC succeeds → return server-side aggregated data
      mockRpc.mockResolvedValue({
        data: [
          { key: 'qu',  count: 3 },
          { key: 'wcm', count: 2 },
          { key: 'cmu', count: 1 },
        ],
        error: null,
      });

      const result = await supabaseModule.getTopQueries(3);
      expect(result[0]).toEqual({ key: 'qu',  count: 3 });
      expect(result[1]).toEqual({ key: 'wcm', count: 2 });
      expect(result).toHaveLength(3);
      expect(mockRpc).toHaveBeenCalledWith('get_top_queries', { limit_count: 3 });
    });

    it('يتراجع للتجميع في JS عند فشل RPC', async () => {
      // RPC fails (e.g., migration 004 not yet applied) → JS fallback
      mockRpc.mockResolvedValue({ data: null, error: { message: 'function does not exist' } });

      const mockData = [
        { matched_key: 'qu' },
        { matched_key: 'qu' },
        { matched_key: 'qu' },
        { matched_key: 'wcm' },
        { matched_key: 'wcm' },
        { matched_key: 'cmu' },
      ];
      const mockLimit = vi.fn().mockResolvedValue({ data: mockData });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockNot   = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ not: mockNot });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await supabaseModule.getTopQueries(3);
      expect(result[0]).toEqual({ key: 'qu',  count: 3 });
      expect(result[1]).toEqual({ key: 'wcm', count: 2 });
      expect(result).toHaveLength(3);
    });
  });

  // ═══════════════════════════════════════
  // Favorites
  // ═══════════════════════════════════════
  describe('addFavorite()', () => {
    it('should add a favorite university', async () => {
      mockFrom.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ data: null }),
      });

      await expect(supabaseModule.addFavorite(1, 'qu')).resolves.not.toThrow();
    });

    it('should silently fail with null userId', async () => {
      await expect(supabaseModule.addFavorite(null, 'qu')).resolves.not.toThrow();
    });
  });

  describe('removeFavorite()', () => {
    it('should remove a favorite university', async () => {
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      });

      await expect(supabaseModule.removeFavorite(1, 'qu')).resolves.not.toThrow();
    });
  });

  describe('getFavorites()', () => {
    it('should return user favorites', async () => {
      const favorites = [
        { university_id: 'qu', added_at: '2026-01-01' },
        { university_id: 'wcm', added_at: '2026-01-02' },
      ];
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: favorites }),
          }),
        }),
      });

      const result = await supabaseModule.getFavorites(1);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for null userId', async () => {
      const result = await supabaseModule.getFavorites(null);
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════
  // getStats
  // ═══════════════════════════════════════
  describe('getStats()', () => {
    it('should return basic stats', async () => {
      mockFrom.mockImplementation((table) => ({
        select: vi.fn().mockResolvedValue({ count: table === 'users' ? 100 : table === 'conversations' ? 500 : 200 }),
      }));

      const result = await supabaseModule.getStats();
      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('totalMessages');
      expect(result).toHaveProperty('totalQueries');
    });
  });
});
