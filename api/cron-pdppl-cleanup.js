/* global process */
/**
 * T-FIX-007: PDPPL Data Retention Cron Job
 * القانون رقم 13 لسنة 2016 — حماية البيانات الشخصية في قطر
 *
 * يعمل يومياً الساعة 2:00 صباحاً لحذف بيانات المستخدمين:
 * 1. المستخدمون الذين طلبوا الحذف (deletion_requested = true)
 * 2. المستخدمون الذين تجاوزت بياناتهم فترة الاحتفاظ (data_retention_until < NOW())
 *
 * شركة النخبوية للبرمجيات | ISO 27001
 *
 * ملاحظة التوافق مع schema.sql:
 *   - جدول users: consent_given، consent_date، data_retention_until
 *   - الأعمدة deletion_requested / deletion_requested_at غير موجودة في schema v2.0
 *     → يجب تشغيل migration (انظر التعليق أسفل الملف) قبل تفعيل هذا الـ cron
 *   - جدول analytics: query، matched_key، source (لا يوجد event_type أو response_source)
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // تأمين الـ endpoint — يُشغَّل فقط من Vercel Cron أو بـ CRON_SECRET
  const cronSecret = process.env.CRON_SECRET || '';
  const authHeader = req.headers.authorization || '';

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const results = {
    deleted: 0,
    anonymized: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // ── 1. حذف المستخدمين الذين طلبوا الحذف الصريح ──
    // الشرط: deletion_requested = true وانتهت فترة الـ grace period (7 أيام)
    // يتطلب وجود عمود deletion_requested و deletion_requested_at في جدول users
    const gracePeriodCutoff = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: requestedDeletion, error: err1 } = await supabase
      .from('users')
      .select('id, phone, deletion_requested_at')
      .eq('deletion_requested', true)
      .lt('deletion_requested_at', gracePeriodCutoff); // 7 أيام grace period

    if (err1) {
      results.errors.push(`Query deletion_requested: ${err1.message}`);
    } else if (requestedDeletion && requestedDeletion.length > 0) {
      for (const user of requestedDeletion) {
        // حذف المحادثات والمفضلات أولاً (CASCADE موجود في schema لكن نضمن)
        await supabase.from('conversations').delete().eq('user_id', user.id);
        await supabase.from('favorites').delete().eq('user_id', user.id);

        // حذف المستخدم
        const { error: delErr } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (delErr) {
          results.errors.push(`Delete user ${user.id}: ${delErr.message}`);
        } else {
          results.deleted++;
        }
      }
    }

    // ── 2. إخفاء هوية المستخدمين منتهية فترة الاحتفاظ ──
    // الشرط: data_retention_until < NOW() و deletion_requested = false
    // عمود data_retention_until موجود في schema.sql (PDPPL Compliance)
    const { data: expiredUsers, error: err2 } = await supabase
      .from('users')
      .select('id, phone')
      .lt('data_retention_until', new Date().toISOString())
      .eq('deletion_requested', false);

    if (err2) {
      results.errors.push(`Query expired: ${err2.message}`);
    } else if (expiredUsers && expiredUsers.length > 0) {
      for (const user of expiredUsers) {
        // Anonymize بدلاً من الحذف المباشر — أفضل ممارسة GDPR/PDPPL
        // phone: UNIQUE NOT NULL → نستبدل بقيمة مشفرة غير قابلة للتتبع
        // profile_data: JSONB → نُفرّغه
        // consent_given: FALSE → نسحب الموافقة
        // deletion_requested: TRUE → نضع علم الحذف للتنظيف لاحقاً
        const { error: anonErr } = await supabase
          .from('users')
          .update({
            phone: `ANON_${user.id.slice(0, 8)}_${Date.now()}`,
            profile_data: {},
            user_type: 'GENERAL',
            track: null,
            gpa: null,
            grade: null,
            nationality: 'unknown',
            conversation_stage: 'STAGE_0',
            consent_given: false,
            consent_date: null,
            deletion_requested: true,
            deletion_requested_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (anonErr) {
          results.errors.push(`Anonymize user ${user.id}: ${anonErr.message}`);
        } else {
          results.anonymized++;
          // حذف المحادثات (CASCADE يُغطيها لكن نؤكد)
          await supabase.from('conversations').delete().eq('user_id', user.id);
          await supabase.from('favorites').delete().eq('user_id', user.id);
        }
      }
    }

    // ── 3. تسجيل نتيجة التشغيل في Analytics ──
    // نستخدم أسماء الأعمدة الصحيحة من schema.sql:
    //   query، matched_key، source (لا يوجد event_type أو response_source)
    await supabase
      .from('analytics')
      .insert({
        query: 'pdppl_cron_cleanup',
        matched_key: `deleted:${results.deleted},anonymized:${results.anonymized}`,
        source: 'cron',
      })
      .catch(() => {}); // silent fail — لا نوقف الـ cron بسبب فشل التسجيل

    console.log(`[PDPPL Cron] Completed: ${JSON.stringify(results)}`);

    return res.status(200).json({
      success: true,
      ...results,
      message: `PDPPL cleanup complete: ${results.deleted} deleted, ${results.anonymized} anonymized`,
    });
  } catch (err) {
    console.error('[PDPPL Cron] Fatal error:', err);
    return res.status(500).json({ error: err.message, ...results });
  }
}

/*
 * ════════════════════════════════════════════════════════════════════
 * DB MIGRATION المطلوبة قبل تفعيل هذا الـ cron
 * شغّل هذا الـ SQL في Supabase SQL Editor:
 * ════════════════════════════════════════════════════════════════════
 *
 * -- إضافة أعمدة PDPPL المتعلقة بطلب الحذف
 * ALTER TABLE users
 *   ADD COLUMN IF NOT EXISTS deletion_requested      BOOLEAN     DEFAULT FALSE,
 *   ADD COLUMN IF NOT EXISTS deletion_requested_at   TIMESTAMPTZ;
 *
 * -- فهرس للبحث السريع في عمليات الـ cron
 * CREATE INDEX IF NOT EXISTS idx_users_deletion_requested
 *   ON users(deletion_requested)
 *   WHERE deletion_requested = TRUE;
 *
 * CREATE INDEX IF NOT EXISTS idx_users_retention_until
 *   ON users(data_retention_until);
 * ════════════════════════════════════════════════════════════════════
 */
