import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, CheckCircle, Info, AlertTriangle, UserCheck, Copyright, RefreshCw, Gavel } from "lucide-react";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "شروط الاستخدام | المستشار الجامعي القطري",
  description: "شروط وأحكام استخدام المستشار الجامعي القطري",
};

const SECTIONS = [
  { id: "acceptance", title: "القبول والموافقة", icon: CheckCircle },
  { id: "service", title: "طبيعة الخدمة", icon: Info },
  { id: "liability", title: "حدود المسؤولية", icon: AlertTriangle },
  { id: "conduct", title: "السلوك المقبول", icon: UserCheck },
  { id: "ip", title: "الملكية الفكرية", icon: Copyright },
  { id: "changes", title: "التعديلات", icon: RefreshCw },
  { id: "law", title: "القانون المعمول به", icon: Gavel },
];

export default function TermsPage() {
  return (
    <div className="h-dvh bg-background flex flex-col">
      <header className="flex-shrink-0 bg-gradient-to-l from-maroon to-maroon-dark text-white shadow-md">
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
          <FileText className="h-5 w-5 text-gold" />
          <h1 className="text-lg font-bold">شروط الاستخدام</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 flex-1 overflow-y-auto">
        {/* Legal compliance banner */}
        <Card className="bg-maroon-light dark:bg-maroon/10 border-maroon/20">
          <CardContent className="py-4 flex items-start gap-3">
            <FileText className="h-5 w-5 text-maroon dark:text-primary mt-0.5 shrink-0" />
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
              <FileText className="h-4 w-4 text-maroon dark:text-primary" />
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
        <Card id="acceptance">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-maroon dark:text-primary" />
              1. القبول والموافقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              باستخدامك للمستشار الجامعي القطري، فإنك توافق على هذه الشروط
              والأحكام. اذا لم توافق، يُرجى عدم استخدام الخدمة.
            </p>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card id="service">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-maroon dark:text-primary" />
              2. طبيعة الخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              المستشار الجامعي القطري هو اداة معلوماتية استشارية. المعلومات المقدمة
              هي ارشادية وليست بديلا عن التواصل المباشر مع الجامعات.
            </p>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card id="liability">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-maroon dark:text-primary" />
              3. حدود المسؤولية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>المعلومات مصدرها المواقع الرسمية للجامعات ولكنها قد تتغير</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>القرار النهائي يعود للطالب وأولياء الامور</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>لا نضمن القبول في اي جامعة</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>لا نتحمل مسؤولية اي خسائر ناتجة عن الاعتماد على معلومات الخدمة</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card id="conduct">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-maroon dark:text-primary" />
              4. السلوك المقبول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>استخدام الخدمة لأغراض تعليمية فقط</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>عدم محاولة اختراق او تعطيل الخدمة</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>عدم ارسال محتوى مسيء او غير لائق</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>عدم استخدام الخدمة لأغراض تجارية بدون اذن</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card id="ip">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Copyright className="h-4 w-4 text-maroon dark:text-primary" />
              5. الملكية الفكرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              جميع المحتويات والعلامات التجارية وقاعدة البيانات مملوكة لشركة اذكياء
              للبرمجيات. يُحظر نسخ او اعادة توزيع المحتوى بدون اذن كتابي.
            </p>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card id="changes">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-maroon dark:text-primary" />
              6. التعديلات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              نحتفظ بحق تعديل هذه الشروط في اي وقت. سيتم اشعار المستخدمين
              بالتغييرات الجوهرية.
            </p>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card id="law">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gavel className="h-4 w-4 text-maroon dark:text-primary" />
              7. القانون المعمول به
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              تخضع هذه الشروط لقوانين دولة قطر، وتختص المحاكم القطرية بالنظر في اي
              نزاع ينشأ عنها.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
