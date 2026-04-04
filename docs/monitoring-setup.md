# إعداد المراقبة والتنبيهات
## Qatar University Advisor

## Vercel Built-in Monitoring:
- Real-time logs: vercel.com/[project]/logs
- Functions duration: < 10s هدف
- Error rate: < 1% هدف

## Uptime Monitoring (مجاني):
- UptimeRobot: https://uptimerobot.com (مجاني حتى 50 monitor)
- Check interval: 5 دقائق
- Alert: Email + WhatsApp

## Error Tracking (مقترح):
- Sentry Free Tier: 5K errors/month مجاناً
- Integration: `import * as Sentry from "@sentry/node"`

## Weekly Health Check:
- [ ] Vercel deployments status
- [ ] Supabase DB size
- [ ] Error logs review
- [ ] API response times
- [ ] Test suite pass rate
