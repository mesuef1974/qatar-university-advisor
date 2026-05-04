import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  Info,
  AlertTriangle,
  UserCheck,
  Gavel,
  Gift,
  Ban,
  GraduationCap,
  XCircle,
  Globe,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "شروط الاستخدام | Terms of Service — Qatar University Advisor",
  description:
    "شروط استخدام خدمة المستشار الجامعي القطري عبر واتساب — خدمة تعليمية مجانية للطلاب في قطر.",
};

const SECTIONS = [
  { id: "acceptance", title: "القبول", icon: CheckCircle },
  { id: "free", title: "خدمة مجانية", icon: Gift },
  { id: "educational", title: "استخدام تعليمي", icon: GraduationCap },
  { id: "eligibility", title: "أهلية المستخدم", icon: UserCheck },
  { id: "as-is", title: "حالة الخدمة", icon: Info },
  { id: "disclaimer", title: "إخلاء المسؤولية", icon: AlertTriangle },
  { id: "acceptable-use", title: "الاستخدام المقبول", icon: Ban },
  { id: "termination", title: "الإنهاء", icon: XCircle },
  { id: "law", title: "القانون والاختصاص", icon: Gavel },
  { id: "english", title: "English Summary", icon: Globe },
];

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Banner */}
        <Card className="bg-maroon-light dark:bg-maroon/10 border-maroon/20">
          <CardContent className="py-4 flex items-start gap-3">
            <FileText className="h-5 w-5 text-maroon dark:text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-foreground">
                شروط استخدام المستشار الجامعي القطري — خدمة مجانية تعليمية عبر واتساب
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                آخر تحديث: 2026-05-04 • تاريخ النفاذ: 2026-05-04
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TOC */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-maroon dark:text-primary" />
              جدول المحتويات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

        {/* 1. Acceptance */}
        <Card id="acceptance">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-maroon dark:text-primary" />
              1. القبول والموافقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              باستخدامك "المستشار الجامعي القطري" عبر واتساب، فإنك توافق على
              هذه الشروط، وعلى{" "}
              <Link href="/privacy" className="text-maroon dark:text-primary underline font-bold">
                سياسة الخصوصية
              </Link>
              . إذا لم توافق، يُرجى عدم استخدام الخدمة.
            </p>
          </CardContent>
        </Card>

        {/* 2. Free */}
        <Card id="free" className="border-emerald-300/40 dark:border-emerald-700/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              2. خدمة مجانية بالكامل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>الخدمة <strong>مجانية</strong> 100% — لا توجد رسوم اشتراك ولا أي مدفوعات.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>لا تعرض الخدمة <strong>إعلانات</strong> ولا تسوّق منتجات لأطراف ثالثة.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>لا توجد عمليات <strong>بيع</strong> أو <strong>تجارة</strong> داخل الخدمة.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>الخدمة مبادرة شخصية تعليمية يقدّمها سفيان مسيف.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3. Educational only */}
        <Card id="educational">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-maroon dark:text-primary" />
              3. استخدام تعليمي فقط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              تُقدَّم الخدمة لأغراض الإرشاد التعليمي حصراً، لمساعدة طلاب المرحلة
              الثانوية في قطر على استكشاف الجامعات والتخصصات. لا يجوز استخدام
              الخدمة لأي غرض تجاري، أو لاستخراج البيانات (scraping)، أو إعادة
              نشر مخرجاتها بدون إذن كتابي.
            </p>
          </CardContent>
        </Card>

        {/* 4. Eligibility */}
        <Card id="eligibility">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-maroon dark:text-primary" />
              4. أهلية المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>الحد الأدنى للسن: <strong>16 عاماً</strong>.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>للمستخدمين دون سن الـ18، يُفترض علم وليّ الأمر بالاستخدام (Parental Awareness).</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>يحق لوليّ الأمر طلب حذف بيانات الطفل في أي وقت عبر البريد المذكور أدناه.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 5. As-is */}
        <Card id="as-is">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-maroon dark:text-primary" />
              5. الخدمة "كما هي" — بدون ضمانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              تُقدَّم الخدمة على أساس <strong>"كما هي" (AS-IS)</strong> و
              <strong>"كما هي متاحة" (AS-AVAILABLE)</strong>، دون أي ضمانات
              صريحة أو ضمنية. لا نضمن استمرارية التشغيل أو خلوّ الخدمة من
              الانقطاعات أو الأخطاء، ولا نضمن تحديث المعلومات في الوقت الحقيقي.
            </p>
          </CardContent>
        </Card>

        {/* 6. Disclaimer */}
        <Card id="disclaimer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-maroon dark:text-primary" />
              6. إخلاء المسؤولية الأكاديمي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>المعلومات هي <strong>إرشاد تعليمي عام</strong> وليست استشارة قبول رسمية.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>القرار النهائي بشأن التقديم أو القبول يجب أن يستند إلى المصادر الرسمية للجامعات.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>لا نضمن قبولك في أي جامعة أو تخصص.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>لا نتحمّل مسؤولية أي قرار يتخذه المستخدم بناءً على مخرجات الخدمة.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 7. Acceptable use */}
        <Card id="acceptable-use">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ban className="h-4 w-4 text-maroon dark:text-primary" />
              7. الاستخدام المقبول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">
              يُحظر، دون حصر:
            </p>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>إرسال رسائل غير مرغوبة (Spam) أو بكميات كبيرة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>استخدام أدوات أتمتة (bots / scripts) لإغراق الخدمة أو الالتفاف على الـ rate limits.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>محاولة اختراق أو هندسة عكسية أو تعطيل الخدمة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>إرسال محتوى مسيء أو غير قانوني أو ينتهك حقوق الغير.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>انتحال الشخصية أو التحايل على ضوابط الموافقة.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 8. Termination */}
        <Card id="termination">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 text-maroon dark:text-primary" />
              8. الإنهاء والانسحاب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>يحق للمستخدم الانسحاب فوراً وفي أي وقت بإرسال كلمة <strong>إلغاء</strong> أو <strong>STOP</strong> عبر واتساب.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>يحق لمزوّد الخدمة إيقاف وصول أي حساب يخالف هذه الشروط أو يسيء استخدام الخدمة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>عند الإلغاء، تُحذف بياناتك خلال 30 يوماً وفق سياسة الخصوصية.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 9. Law */}
        <Card id="law">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gavel className="h-4 w-4 text-maroon dark:text-primary" />
              9. القانون المعمول به والاختصاص القضائي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              تخضع هذه الشروط لقوانين <strong>دولة قطر</strong> وتُفسَّر وفقها.
              تختصّ <strong>محاكم دولة قطر</strong> حصرياً بالنظر في أي نزاع
              ينشأ عن استخدام الخدمة أو هذه الشروط.
            </p>
          </CardContent>
        </Card>

        {/* English summary */}
        <Card id="english" dir="ltr" className="text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-maroon dark:text-primary" />
              English Summary (Secondary)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
            <p>
              <strong>Qatar University Advisor</strong> is a free WhatsApp
              educational chatbot for high-school students in Qatar. By using
              the service, you accept these Terms and the{" "}
              <Link href="/privacy" className="text-maroon dark:text-primary underline">
                Privacy Policy
              </Link>.
            </p>
            <p>
              <strong>Free of charge:</strong> no fees, no subscriptions, no
              ads, no commerce.
            </p>
            <p>
              <strong>Educational use only:</strong> the service provides
              general educational guidance and is not a substitute for formal
              admissions advice.
            </p>
            <p>
              <strong>Eligibility:</strong> users must be 16 years of age or
              older. For users under 18, parental awareness is assumed; a parent
              or guardian may request data deletion at any time.
            </p>
            <p>
              <strong>As-is:</strong> the service is provided &quot;as-is&quot;
              and &quot;as-available&quot; without warranties of any kind.
            </p>
            <p>
              <strong>Disclaimer:</strong> outputs are educational guidance
              only, not formal admissions advice. We do not guarantee acceptance
              into any university.
            </p>
            <p>
              <strong>Acceptable use:</strong> no spam, no automation abuse, no
              hacking attempts, no harmful or illegal content.
            </p>
            <p>
              <strong>Termination:</strong> users may opt out at any time by
              sending the keyword <strong>&quot;إلغاء&quot;</strong> or
              <strong> &quot;STOP&quot;</strong> via WhatsApp.
            </p>
            <p>
              <strong>Governing law:</strong> these Terms are governed by the
              laws of the <strong>State of Qatar</strong>, and disputes are
              subject to the exclusive jurisdiction of <strong>Qatar courts</strong>.
            </p>
            <p className="text-[11px]">Last updated: 2026-05-04.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
