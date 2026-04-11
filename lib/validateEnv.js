/* global process */
/**
 * SEC-A4: التحقق من متغيرات البيئة عند البدء
 * يمنع التطبيق من العمل بدون إعدادات أساسية — رسائل خطأ واضحة
 * شركة أذكياء للبرمجيات | 2026-04-05
 */

/**
 * متغيرات البيئة المطلوبة حسب السياق
 */
const ENV_SCHEMAS = {
  webhook: {
    required: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_ID', 'WEBHOOK_VERIFY_TOKEN'],
    optional: ['WEBHOOK_APP_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  },
  admin: {
    required: ['ADMIN_PASSWORD'],
    optional: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  },
  health: {
    required: [],
    optional: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  },
  cron: {
    required: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    optional: [],
  },
  chat: {
    required: [],
    optional: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY'],
  },
};

/**
 * يتحقق من وجود متغيرات البيئة المطلوبة
 * @param {string} context - اسم السياق (webhook, admin, health, cron)
 * @returns {{ valid: boolean, missing: string[], warnings: string[] }}
 */
export function validateEnv(context) {
  const schema = ENV_SCHEMAS[context];
  if (!schema) {
    return { valid: true, missing: [], warnings: [`Unknown context: ${context}`] };
  }

  const missing = schema.required.filter(
    (key) => !process.env[key] || process.env[key].trim() === ''
  );

  const warnings = schema.optional.filter(
    (key) => !process.env[key]
  ).map((key) => `${key} غير مُعيَّن — بعض الميزات قد لا تعمل`);

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * يتحقق ويُرجع Response 500 إذا كانت متغيرات البيئة ناقصة
 * @param {string} context
 * @param {object} res - Vercel response object
 * @returns {boolean} true إذا كانت البيئة صالحة، false إذا تم إرجاع خطأ
 */
export function requireEnv(context, res) {
  const { valid, missing, warnings } = validateEnv(context);

  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(`[ENV] ⚠️  ${w}`));
  }

  if (!valid) {
    console.error(`[ENV] ❌ Missing required env vars for ${context}: ${missing.join(', ')}`);
    res.status(500).json({
      error: 'Server configuration error',
      message: 'Required environment variables are missing. Check server logs.',
    });
    return false;
  }

  return true;
}
