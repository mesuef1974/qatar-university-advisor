import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shield, Lock, Database, Eye, Clock, Users, ShieldCheck, Mail } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | المستشار الجامعي القطري",
  description: "سياسة الخصوصية وحماية البيانات الشخصية وفق قانون PDPPL القطري",
};

const SECTIONS = [
  { id: "intro", title: "مقدمة", icon: Shield },
  { id: "data-collected", title: "البيانات التي نجمعها", icon: Database },
  { id: "data-usage", title: "كيف نستخدم بياناتك", icon: Eye },
  { id: "data-sharing", title: "مشاركة البيانات", icon: Users },
  { id: "retention", title: "فترة الاحتفاظ", icon: Clock },
  { id: "rights", title: "حقوقك", icon: ShieldCheck },
  { id: "security", title: "الامان", icon: Lock },
  { id: "contact", title: "التواصل", icon: Mail },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Legal compliance banner */}
        <Card className="bg-maroon-light dark:bg-maroon/10 border-maroon/20">
          <CardContent className="py-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-maroon dark:text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-foreground">
                نلتزم بحماية بياناتك وفق القانون القطري رقم 13 لسنة 2016 (PDPPL)
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                آخر تحديث: ابريل 2026 | شركة اذكياء للبرمجيات
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-maroon dark:text-primary" />
              جدول المحتويات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SECTIONS.map((section, idx) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-maroon dark:hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-muted"
                >
                  <section.icon className="h-3 w-3 shrink-0" />
                  <span>{idx + 1}. {section.title}</span>
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <Card id="intro">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-maroon dark:text-primary" />
              1. مقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              نحن في "المستشار الجامعي القطري" التابع لـ شركة أذكياء للبرمجيات
              (محل التحكم في البيانات — دولة قطر) نلتزم بحماية خصوصية بياناتك
              الشخصية وفقاً لقانون حماية البيانات الشخصية القطري رقم 13 لسنة
              2016 (PDPPL). تشرح هذه الوثيقة الأساس القانوني للمعالجة، وفئات
              البيانات، والمعالجين الفرعيين، ومدة الاحتفاظ، وحقوقك بموجب المواد
              22–25 من القانون.
            </p>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card id="data-collected">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-maroon dark:text-primary" />
              2. البيانات التي نجمعها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>رقم الهاتف (للتواصل عبر واتساب — أساس قانوني: المادة 7 من PDPPL، الموافقة الصريحة)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>المعدل الدراسي والمسار الأكاديمي (اختياري — لتخصيص التوصية)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>الجنسية (قطري/مقيم — لاحتساب الرسوم وشروط القبول)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>محتوى المحادثة (لتحسين جودة الردود — يُحتفظ بآخر 10 رسائل فقط)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>معلومات تقنية محدودة (IP، نوع الجهاز — لأغراض الأمان وتوثيق الموافقة)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card id="data-usage">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-maroon dark:text-primary" />
              3. كيف نستخدم بياناتك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>تقديم استشارة جامعية مخصصة (الغرض الأساسي وفق المادة 7 من PDPPL)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>تحسين دقة الردود والتوصيات بناءً على ملفك التعريفي</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>أغراض إحصائية مُجمّعة (بدون كشف الهوية الشخصية)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>لا نستخدم بياناتك للتسويق أو نقلها إلى أطراف ثالثة لأغراض تجارية</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card id="data-sharing">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-maroon dark:text-primary" />
              4. مشاركة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">
              لا نبيع بياناتك الشخصية. نستعين بمعالجين فرعيين (Sub-processors)
              مُلزَمين تعاقدياً بمعايير حماية معادلة لـ PDPPL:
            </p>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Supabase</strong> — قاعدة بيانات PostgreSQL (مقر: الولايات المتحدة / الاتحاد الأوروبي)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Vercel</strong> — استضافة التطبيق وتشغيل الـ API (مقر: الولايات المتحدة)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Meta WhatsApp Business API</strong> — قناة المراسلة (مقر: أيرلندا / الولايات المتحدة)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Google Gemini API</strong> — المعالجة الذكية للردود (مقر: الولايات المتحدة)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card id="retention">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-maroon dark:text-primary" />
              5. فترة الاحتفاظ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              وفقاً للمادة 17 من قانون PDPPL، نحتفظ ببياناتك طوال مدة استخدامك
              للخدمة + 30 يوماً بعد طلب الحذف أو انتهاء الخدمة (للسماح
              بالنسخ الاحتياطية والتدقيق القانوني). بعد انقضاء هذه المدة يتم
              الحذف الكامل أو إخفاء الهوية (Anonymization) بشكل لا يمكن
              عكسه. سجلات الموافقة (consent logs) تُحفظ مدة أطول للامتثال
              القانوني.
            </p>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card id="rights">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-maroon dark:text-primary" />
              6. حقوقك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>المادة 22</strong> — حق الوصول إلى بياناتك والاطلاع على ما نعالجه عنك</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>المادة 23</strong> — حق تصحيح أو تحديث البيانات غير الدقيقة</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>المادة 24</strong> — حق حذف البيانات (الحق في النسيان)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>المادة 25</strong> — حق الاعتراض على المعالجة وسحب الموافقة في أي وقت</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>حق نقل البيانات (Data Portability) بصيغة منظمة قابلة للقراءة الآلية</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card id="security">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-maroon dark:text-primary" />
              7. الامان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              نطبّق ضوابط أمنية تقنية وتنظيمية مناسبة وفق متطلبات PDPPL: تشفير
              HTTPS/TLS أثناء النقل، Row Level Security في قاعدة البيانات،
              فصل صارم بين مفاتيح الخدمة (Service Role) والمستخدم النهائي،
              مراقبة مستمرة عبر Sentry، تدقيق دوري للصلاحيات، وخطة استجابة
              للحوادث (DR Runbook) لإبلاغ السلطة المختصة خلال 72 ساعة عند
              أي خرق محتمل.
            </p>
          </CardContent>
        </Card>

        {/* Section 8 */}
        <Card id="contact">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-maroon dark:text-primary" />
              8. التواصل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              مسؤول حماية البيانات (DPO) في شركة أذكياء للبرمجيات — قطر:{" "}
              <a href="mailto:dpo@azkia.qa" className="text-maroon dark:text-primary underline font-bold">
                dpo@azkia.qa
              </a>
              . ساعات العمل: الأحد–الخميس، 9:00 ص – 5:00 م (بتوقيت الدوحة).
              نلتزم بالرد على طلبات ممارسة الحقوق خلال 30 يوماً وفق المادة 26
              من PDPPL. كما يمكنك تقديم طلباتك مباشرة عبر{" "}
              <Link href="/data-rights" className="text-maroon dark:text-primary underline font-bold">
                صفحة حقوق البيانات
              </Link>.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
