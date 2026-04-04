/**
 * Unit Tests — nationality-advisor.js
 * Tests for addNationalityContext
 */
import { describe, it, expect } from 'vitest';
import { addNationalityContext } from '../../lib/nationality-advisor.js';

const baseResponse = { text: 'base text', suggestions: ['s1', 's2'] };

describe('nationality-advisor — addNationalityContext', () => {
  // ── Edge cases ────────────────────────────────────────────────────
  it('returns response unchanged when nationality is null', () => {
    expect(addNationalityContext(baseResponse, null, 'qu')).toBe(baseResponse);
  });

  it('returns response unchanged when nationality is undefined', () => {
    expect(addNationalityContext(baseResponse, undefined, 'qu')).toBe(baseResponse);
  });

  it('returns response unchanged when response is null', () => {
    expect(addNationalityContext(null, 'qatari', 'qu')).toBe(null);
  });

  it('returns response unchanged for unknown context', () => {
    const result = addNationalityContext(baseResponse, 'qatari', 'unknown_context');
    expect(result).toBe(baseResponse);
  });

  // ── Military colleges — non-Qatari ────────────────────────────────
  describe('military colleges — non_qatari', () => {
    const militaryKeys = ['abmmc', 'police', 'airforce', 'naval', 'cyber', 'rlesc', 'general_military', 'compare_military', 'fitness_military'];

    militaryKeys.forEach((key) => {
      it(`shows Qatari-only warning for ${key}`, () => {
        const result = addNationalityContext(baseResponse, 'non_qatari', key);
        expect(result.text).toContain('للقطريين فقط');
        expect(result.text).toContain('بدائل متاحة');
        expect(result.suggestions).toContain('منح لغير القطريين');
      });
    });

    it('does not modify response for qatari user on military context', () => {
      const result = addNationalityContext(baseResponse, 'qatari', 'abmmc');
      expect(result).toBe(baseResponse);
    });
  });

  // ── Government scholarships — non-Qatari ──────────────────────────
  describe('government scholarships — non_qatari', () => {
    const govKeys = ['scholarship_amiri', 'scholarship_external', 'scholarship_internal', 'amiri', 'thamoon'];

    govKeys.forEach((key) => {
      it(`shows scholarship alternatives for ${key}`, () => {
        const result = addNationalityContext(baseResponse, 'non_qatari', key);
        expect(result.text).toContain('للقطريين فقط');
        expect(result.text).toContain('HBKU');
        expect(result.suggestions).toContain('HBKU منح كاملة');
      });
    });
  });

  // ── Company scholarships — non-Qatari ─────────────────────────────
  describe('company scholarships — non_qatari', () => {
    const companyKeys = ['scholarship_qatarenergy', 'scholarship_qatarairways', 'scholarship_qnb', 'scholarship_kahramaa', 'scholarship_ashghal', 'scholarship_nakilat'];

    companyKeys.forEach((key) => {
      it(`shows company scholarship warning for ${key}`, () => {
        const result = addNationalityContext(baseResponse, 'non_qatari', key);
        expect(result.text).toContain('للقطريين فقط');
        expect(result.suggestions).toContain('منح لغير القطريين');
      });
    });
  });

  // ── Qatar University ──────────────────────────────────────────────
  describe('Qatar University (qu)', () => {
    it('shows free tuition info for Qatari', () => {
      const result = addNationalityContext(baseResponse, 'qatari', 'qu');
      expect(result.text).toContain('مجانية تماماً');
      expect(result.text).toContain('كطالب قطري');
    });

    it('shows tuition fees for non-Qatari', () => {
      const result = addNationalityContext(baseResponse, 'non_qatari', 'qu');
      expect(result.text).toContain('لغير القطريين');
      expect(result.text).toContain('منحة المواهب');
    });
  });

  // ── Education City Universities ───────────────────────────────────
  describe('Education City (wcm, cmu, tamu, gu, nu, vcu)', () => {
    const eduKeys = ['wcm', 'cmu', 'tamu', 'gu', 'nu', 'vcu'];

    eduKeys.forEach((key) => {
      it(`shows gov scholarship info for qatari at ${key}`, () => {
        const result = addNationalityContext(baseResponse, 'qatari', key);
        expect(result.text).toContain('كطالب قطري');
        expect(result.text).toContain('للابتعاث');
      });

      it(`shows QF grants info for non_qatari at ${key}`, () => {
        const result = addNationalityContext(baseResponse, 'non_qatari', key);
        expect(result.text).toContain('لغير القطريين');
        expect(result.text).toContain('مؤسسة قطر');
      });
    });
  });

  // ── HBKU ──────────────────────────────────────────────────────────
  describe('HBKU', () => {
    it('shows HBKU benefits for non-Qatari', () => {
      const result = addNationalityContext(baseResponse, 'non_qatari', 'hbku');
      expect(result.text).toContain('لغير القطريين');
      expect(result.text).toContain('5,000');
      expect(result.text).toContain('7,500');
    });

    it('does not modify for qatari at hbku', () => {
      const result = addNationalityContext(baseResponse, 'qatari', 'hbku');
      expect(result).toBe(baseResponse);
    });
  });

  // ── UDST ──────────────────────────────────────────────────────────
  describe('UDST', () => {
    it('shows free for Qatari', () => {
      const result = addNationalityContext(baseResponse, 'qatari', 'udst');
      expect(result.text).toContain('مجانية للقطريين');
    });

    it('shows fees for non-Qatari', () => {
      const result = addNationalityContext(baseResponse, 'non_qatari', 'udst');
      expect(result.text).toContain('لغير القطريين');
      expect(result.text).toContain('13,000');
    });
  });

  // ── CCQ ────────────────────────────────────────────────────────────
  describe('CCQ', () => {
    it('shows free + transfer for Qatari', () => {
      const result = addNationalityContext(baseResponse, 'qatari', 'ccq');
      expect(result.text).toContain('مجانية للقطريين');
      expect(result.text).toContain('2+2');
    });

    it('shows residency requirement for non-Qatari', () => {
      const result = addNationalityContext(baseResponse, 'non_qatari', 'ccq');
      expect(result.text).toContain('لغير القطريين');
      expect(result.text).toContain('إقامة سارية');
    });
  });

  // ── Grade-based ───────────────────────────────────────────────────
  describe('grade context', () => {
    it('shows restrictions for non-Qatari', () => {
      const result = addNationalityContext(baseResponse, 'non_qatari', 'grade');
      expect(result.text).toContain('لغير القطريين');
      expect(result.text).toContain('الكليات العسكرية غير متاحة');
    });

    it('does not modify for qatari grade context', () => {
      const result = addNationalityContext(baseResponse, 'qatari', 'grade');
      expect(result).toBe(baseResponse);
    });
  });

  // ── Salaries ──────────────────────────────────────────────────────
  describe('salaries', () => {
    it('shows Qatari employment advantages', () => {
      const result = addNationalityContext(baseResponse, 'qatari', 'salaries');
      expect(result.text).toContain('مميزات القطري');
      expect(result.text).toContain('التوطين');
    });

    it('shows package info for non-Qatari', () => {
      const result = addNationalityContext(baseResponse, 'non_qatari', 'salaries');
      expect(result.text).toContain('لغير القطريين');
      expect(result.text).toContain('بدل سكن');
    });
  });

  // ── Teach for Qatar ───────────────────────────────────────────────
  describe('teach_for_qatar', () => {
    it('shows open for residents for non-Qatari', () => {
      const result = addNationalityContext(baseResponse, 'non_qatari', 'teach_for_qatar');
      expect(result.text).toContain('مفتوح لغير القطريين');
    });

    it('does not modify for qatari', () => {
      const result = addNationalityContext(baseResponse, 'qatari', 'teach_for_qatar');
      expect(result).toBe(baseResponse);
    });
  });

  // ── Response with no suggestions ──────────────────────────────────
  it('handles response with no suggestions array', () => {
    const resp = { text: 'test', suggestions: undefined };
    const result = addNationalityContext(resp, 'non_qatari', 'abmmc');
    expect(result.text).toContain('للقطريين فقط');
    expect(Array.isArray(result.suggestions)).toBe(true);
  });
});
