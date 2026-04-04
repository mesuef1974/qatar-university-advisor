# دليل إعداد Staging Environment

## الخطوات:
1. في Vercel Dashboard → Settings → Git
2. تفعيل "Preview Deployments" لجميع branches
3. إنشاء branch `staging` من `main`
4. في Vercel → Environment Variables:
   - أضف كل متغيرات .env.staging.example بقيم Staging
   - اختر "Preview" فقط (ليس Production)
5. كل push لـ staging branch يُنشئ deployment تلقائياً

## قاعدة العمل:
feature-branch → staging branch → main (production)

## اختبار Staging:
- URL: https://qatar-university-advisor-git-staging-YOURTEAM.vercel.app
- Admin: /api/admin مع ADMIN_PASSWORD الخاص بـ Staging

## ملاحظات مهمة:
- قاعدة بيانات Staging يجب أن تكون مشروع Supabase مستقل عن Production
- لا تُشارك CRON_SECRET بين Staging و Production
- تأكد من تحديد "Preview" وليس "Production" أو "Development" عند إضافة متغيرات Staging في Vercel
