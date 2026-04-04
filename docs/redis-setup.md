# إعداد Upstash Redis للـ Rate Limiting الموزع

## لماذا Redis؟
Vercel Serverless تُشغّل instances متعددة مستقلة.
الـ in-memory rate limiting لا يُشارك بين instances.
Redis يوفر تخزيناً مشتركاً لجميع instances.

## الخطوات:
1. انتقل إلى https://upstash.com
2. أنشئ حساباً مجانياً
3. أنشئ Redis Database جديدة
   - Region: اختر الأقرب (eu-central-1 أو us-east-1)
   - Plan: Free (10,000 requests/day)
4. من الـ Database dashboard، انسخ:
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN

## إضافة للـ Vercel:
1. Vercel Dashboard → Settings → Environment Variables
2. أضف UPSTASH_REDIS_REST_URL (Production + Preview)
3. أضف UPSTASH_REDIS_REST_TOKEN (Production + Preview)

## اختبار:
curl https://your-app.vercel.app/api/admin -H "Authorization: Bearer wrong"
# كرر 6 مرات → يجب أن تحصل على 429 في السادسة

## ملاحظة:
إذا لم تُضف متغيرات Upstash، النظام يرجع تلقائياً
للـ in-memory (مناسب للتطوير المحلي).
