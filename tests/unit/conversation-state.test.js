/**
 * Unit Tests — Conversation State Machine
 * T-Q7-T015: رفع تغطية الاختبارات
 * مُصحَّح ليتوافق مع exports الفعلية من conversation-state.js
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/supabase.js', () => ({
  supabase: null,
  isSupabaseAvailable: vi.fn().mockReturnValue(false),
  getOrCreateUser: vi.fn().mockResolvedValue({ id: 'test-id', phone: '97412345678' }),
  getUserProfileData: vi.fn().mockResolvedValue({}),
  saveUserProfileData: vi.fn().mockResolvedValue(true),
  getConversationHistory: vi.fn().mockResolvedValue([]),
  saveMessage: vi.fn().mockResolvedValue(true),
  logQuery: vi.fn().mockResolvedValue(true),
}));

import {
  STAGES,
  getNextStage,
  getStagePrompt,
  isConversationComplete,
  getProfileCompleteness,
  generateFinalReport,
} from '../../lib/conversation-state.js';

// ══════════════════════════════════════════════════════
describe('Conversation State Machine — STAGES', () => {
  it('يحتوي على جميع المراحل السبع', () => {
    expect(STAGES).toHaveProperty('STAGE_0');
    expect(STAGES).toHaveProperty('STAGE_1');
    expect(STAGES).toHaveProperty('STAGE_2');
    expect(STAGES).toHaveProperty('STAGE_3');
    expect(STAGES).toHaveProperty('STAGE_4');
    expect(STAGES).toHaveProperty('STAGE_5');
    expect(STAGES).toHaveProperty('STAGE_6');
  });

  it('قيم المراحل نصية صحيحة', () => {
    expect(STAGES.STAGE_0).toBe('STAGE_0');
    expect(STAGES.STAGE_6).toBe('STAGE_6');
  });

  it('عدد المراحل 7', () => {
    expect(Object.keys(STAGES)).toHaveLength(7);
  });
});

// ══════════════════════════════════════════════════════
describe('Conversation State Machine — getNextStage', () => {
  it('يُرجع مرحلة صالحة من القائمة', () => {
    const next = getNextStage(STAGES.STAGE_0, {}, 'مرحباً');
    expect(Object.values(STAGES)).toContain(next);
  });

  it('ينتقل نحو المنح عند ذكرها', () => {
    const next = getNextStage(STAGES.STAGE_1, { nationality: 'qatari' }, 'ما هي المنح المتاحة؟');
    expect(next).toBe(STAGES.STAGE_5);
  });

  it('يقترح التقرير النهائي لملف مكتمل', () => {
    const fullProfile = { nationality: 'qatari', gpa: 90, track: 'scientific' };
    const next = getNextStage(STAGES.STAGE_4, fullProfile, 'أريد خطة دراسية');
    expect(next).toBe(STAGES.STAGE_6);
  });

  it('يتعامل مع profile فارغ بدون أخطاء', () => {
    expect(() => getNextStage(STAGES.STAGE_0, {}, '')).not.toThrow();
  });

  it('يُرجع مرحلة صالحة عند سؤال عن الجامعات', () => {
    const next = getNextStage(STAGES.STAGE_2, { nationality: 'qatari', gpa: 85 }, 'ما هي أفضل جامعة؟');
    expect(Object.values(STAGES)).toContain(next);
  });
});

// ══════════════════════════════════════════════════════
describe('Conversation State Machine — getStagePrompt', () => {
  it('يُرجع قيمة (string أو null) لكل مرحلة', () => {
    Object.values(STAGES).forEach(stage => {
      const prompt = getStagePrompt(stage, {});
      expect(prompt === null || typeof prompt === 'string').toBe(true);
    });
  });

  it('يُرجع نصاً لـ STAGE_1 بدون nationality', () => {
    const prompt = getStagePrompt(STAGES.STAGE_1, {});
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('يُرجع نصاً لـ STAGE_2 بدون gpa', () => {
    const prompt = getStagePrompt(STAGES.STAGE_2, { nationality: 'qatari' });
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('يُرجع نصاً للمنح حسب الجنسية', () => {
    const promptQatari    = getStagePrompt(STAGES.STAGE_5, { nationality: 'qatari' });
    const promptNonQatari = getStagePrompt(STAGES.STAGE_5, { nationality: 'non_qatari' });
    expect(typeof promptQatari).toBe('string');
    expect(typeof promptNonQatari).toBe('string');
    expect(promptQatari).not.toBe(promptNonQatari);
  });
});

// ══════════════════════════════════════════════════════
describe('Conversation State Machine — isConversationComplete', () => {
  it('يُرجع boolean دائماً', () => {
    Object.values(STAGES).forEach(stage => {
      expect(typeof isConversationComplete(stage, {})).toBe('boolean');
    });
  });

  it('يُرجع false لـ STAGE_0 مع ملف فارغ', () => {
    expect(isConversationComplete(STAGES.STAGE_0, {})).toBe(false);
  });

  it('يُرجع false لـ STAGE_3 مع ملف جزئي', () => {
    expect(isConversationComplete(STAGES.STAGE_3, { nationality: 'qatari' })).toBe(false);
  });
});

// ══════════════════════════════════════════════════════
describe('Conversation State Machine — getProfileCompleteness', () => {
  it('يُرجع 0 لملف فارغ', () => {
    expect(getProfileCompleteness({})).toBe(0);
  });

  it('يُرجع 100 لملف مكتمل بجميع الحقول', () => {
    const full = {
      nationality: 'qatari',
      userType: 'student_hs',
      gpa: 90,
      track: 'scientific',
      preferredMajor: 'engineering',
    };
    expect(getProfileCompleteness(full)).toBe(100);
  });

  it('يُرجع قيمة بين 0 و 100 لملف جزئي', () => {
    const partial = { nationality: 'qatari', gpa: 85 };
    const score = getProfileCompleteness(partial);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('يُرجع 25 عند تعبئة nationality فقط', () => {
    expect(getProfileCompleteness({ nationality: 'qatari' })).toBe(25);
  });
});

// ══════════════════════════════════════════════════════
describe('Conversation State Machine — generateFinalReport', () => {
  it('يُرجع object لملف مكتمل', () => {
    const profile = {
      nationality: 'qatari',
      gpa: 90,
      track: 'scientific',
      preferredMajor: 'engineering',
    };
    const report = generateFinalReport(profile);
    expect(typeof report).toBe('object');
    expect(report).not.toBeNull();
  });

  it('يحتوي على خاصية text', () => {
    const report = generateFinalReport({ nationality: 'qatari', gpa: 90 });
    expect(report).toHaveProperty('text');
    expect(typeof report.text).toBe('string');
    expect(report.text.length).toBeGreaterThan(0);
  });

  it('يعمل بدون أخطاء لملف فارغ', () => {
    expect(() => generateFinalReport({})).not.toThrow();
  });

  it('يعمل بدون أخطاء لـ profile جزئي', () => {
    expect(() => generateFinalReport({ nationality: 'non_qatari', gpa: 75 })).not.toThrow();
  });
});
