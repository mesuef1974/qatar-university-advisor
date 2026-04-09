import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | المستشار الجامعي القطري",
  description: "سياسة الخصوصية وحماية البيانات الشخصية وفق قانون PDPPL القطري",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/chat">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Shield className="h-5 w-5 text-gold" />
          <h1 className="text-lg font-bold">سياسة الخصوصية</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground text-sm mb-6">
          سارية من 4 ابريل 2026 | شركة اذكياء للبرمجيات
        </p>

        <h2>1. مقدمة</h2>
        <p>
          نحن في المستشار الجامعي القطري نلتزم بحماية خصوصية بياناتك الشخصية
          وفقا لقانون حماية البيانات الشخصية القطري رقم 13 لسنة 2016 (PDPPL).
        </p>

        <h2>2. البيانات التي نجمعها</h2>
        <ul>
          <li>رقم الهاتف (للتواصل عبر واتساب)</li>
          <li>المعدل الدراسي والمسار الاكاديمي (اختياري)</li>
          <li>الجنسية (قطري/مقيم)</li>
          <li>سجل المحادثات (لتحسين جودة النصائح)</li>
          <li>معلومات تقنية (IP، نوع المتصفح)</li>
        </ul>

        <h2>3. كيف نستخدم بياناتك</h2>
        <ul>
          <li>تقديم نصائح جامعية مخصصة</li>
          <li>تحسين دقة الردود والتوصيات</li>
          <li>اغراض احصائية مجمّعة (بدون كشف الهوية)</li>
        </ul>

        <h2>4. مشاركة البيانات</h2>
        <p>
          لا نبيع او نشارك بياناتك الشخصية مع اطراف ثالثة. نستخدم خدمات
          سحابية آمنة (Supabase، Vercel) لتخزين ومعالجة البيانات.
        </p>

        <h2>5. فترة الاحتفاظ</h2>
        <p>
          نحتفظ ببياناتك لمدة 12 شهرا من آخر تفاعل. بعد ذلك، يتم حذفها
          تلقائيا او اخفاء هويتها وفق آلية PDPPL.
        </p>

        <h2>6. حقوقك</h2>
        <ul>
          <li>حق الوصول الى بياناتك</li>
          <li>حق تصحيح البيانات</li>
          <li>حق حذف البيانات</li>
          <li>حق سحب الموافقة</li>
          <li>حق نقل البيانات</li>
        </ul>

        <h2>7. الامان</h2>
        <p>
          نستخدم تشفير HTTPS وRow Level Security في قاعدة البيانات وآليات حماية
          متقدمة ضد الاختراق.
        </p>

        <h2>8. التواصل</h2>
        <p>
          لاي استفسارات تتعلق بالخصوصية، تواصل معنا عبر صفحة حقوق البيانات.
        </p>
      </main>
    </div>
  );
}
