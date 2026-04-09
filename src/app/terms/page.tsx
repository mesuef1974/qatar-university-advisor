import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "شروط الاستخدام | المستشار الجامعي القطري",
  description: "شروط وأحكام استخدام المستشار الجامعي القطري",
};

export default function TermsPage() {
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
          <FileText className="h-5 w-5 text-gold" />
          <h1 className="text-lg font-bold">شروط الاستخدام</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground text-sm mb-6">
          سارية من 4 ابريل 2026 | شركة اذكياء للبرمجيات
        </p>

        <h2>1. القبول والموافقة</h2>
        <p>
          باستخدامك للمستشار الجامعي القطري، فإنك توافق على هذه الشروط
          والأحكام. اذا لم توافق، يُرجى عدم استخدام الخدمة.
        </p>

        <h2>2. طبيعة الخدمة</h2>
        <p>
          المستشار الجامعي القطري هو اداة معلوماتية استشارية. المعلومات المقدمة
          هي ارشادية وليست بديلا عن التواصل المباشر مع الجامعات.
        </p>

        <h2>3. حدود المسؤولية</h2>
        <ul>
          <li>المعلومات مصدرها المواقع الرسمية للجامعات ولكنها قد تتغير</li>
          <li>القرار النهائي يعود للطالب وأولياء الامور</li>
          <li>لا نضمن القبول في اي جامعة</li>
          <li>لا نتحمل مسؤولية اي خسائر ناتجة عن الاعتماد على معلومات الخدمة</li>
        </ul>

        <h2>4. السلوك المقبول</h2>
        <ul>
          <li>استخدام الخدمة لأغراض تعليمية فقط</li>
          <li>عدم محاولة اختراق او تعطيل الخدمة</li>
          <li>عدم ارسال محتوى مسيء او غير لائق</li>
          <li>عدم استخدام الخدمة لأغراض تجارية بدون اذن</li>
        </ul>

        <h2>5. الملكية الفكرية</h2>
        <p>
          جميع المحتويات والعلامات التجارية وقاعدة البيانات مملوكة لشركة اذكياء
          للبرمجيات. يُحظر نسخ او اعادة توزيع المحتوى بدون اذن كتابي.
        </p>

        <h2>6. التعديلات</h2>
        <p>
          نحتفظ بحق تعديل هذه الشروط في اي وقت. سيتم اشعار المستخدمين
          بالتغييرات الجوهرية.
        </p>

        <h2>7. القانون المعمول به</h2>
        <p>
          تخضع هذه الشروط لقوانين دولة قطر، وتختص المحاكم القطرية بالنظر في اي
          نزاع ينشأ عنها.
        </p>
      </main>
    </div>
  );
}
