/**
 * Environment Variables Type Declarations
 * يوفر type safety للـ process.env
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    SUPABASE_URL:                string;
    SUPABASE_ANON_KEY:           string;
    SUPABASE_SERVICE_ROLE_KEY:   string;

    // Claude AI
    ANTHROPIC_API_KEY:              string;

    // WhatsApp
    WHATSAPP_TOKEN:              string;
    WHATSAPP_PHONE_ID:           string;
    WEBHOOK_SECRET:              string;

    // Admin
    ADMIN_PASSWORD:              string;
    ADMIN_ORIGIN?:               string;

    // PDPPL Cron
    CRON_SECRET:                 string;

    // Redis (Optional)
    UPSTASH_REDIS_REST_URL?:     string;
    UPSTASH_REDIS_REST_TOKEN?:   string;

    // Environment
    NODE_ENV:   'development' | 'staging' | 'production' | 'test';
    VITE_ENV?:  'development' | 'staging' | 'production' | 'ci';
  }
}
