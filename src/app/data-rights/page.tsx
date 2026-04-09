import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Scale, UserCheck, Trash2, Download, Ban, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "حقوق البيانات | المستشار الجامعي القطري",
  description:
    "حقوق اصحاب البيانات وفق قانون حماية البيانات الشخصية القطري PDPPL",
};

const RIGHTS = [
  {
    icon: UserCheck,
    title: "حق الوصول",
    description: "يحق لك طلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك",
  },
  {
    icon: Send,
    title: "حق التصحيح",
    description: "يحق لك طلب تصحيح اي بيانات غير دقيقة او غير مكتملة",
  },
  {
    icon: Trash2,
    title: "حق الحذف",
    description: "يحق لك طلب حذف بياناتك الشخصية نهائيا",
  },
  {
    icon: Ban,
    title: "حق سحب الموافقة",
    description: "يحق لك سحب موافقتك على معالجة بياناتك في اي وقت",
  },
  {
    icon: Download,
    title: "حق نقل البيانات",
    description: "يحق لك الحصول على بياناتك بصيغة قابلة للقراءة آليا",
  },
];

export default function DataRightsPage() {
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
          <Scale className="h-5 w-5 text-gold" />
          <h1 className="text-lg font-bold">حقوق البيانات</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-2">حقوقك محفوظة</h2>
          <p className="text-sm text-muted-foreground">
            وفق قانون حماية البيانات الشخصية القطري رقم 13 لسنة 2016 (PDPPL)
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {RIGHTS.map((right) => (
            <Card key={right.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <right.icon className="h-4 w-4 text-maroon dark:text-primary" />
                  {right.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-muted-foreground">
                  {right.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-maroon-light dark:bg-maroon/10 border-maroon/20">
          <CardContent className="py-6 text-center">
            <h3 className="font-bold text-base mb-2">
              كيف تمارس حقوقك؟
            </h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              ارسل &quot;احذف بياناتي&quot; في المحادثة او تواصل معنا مباشرة.
              <br />
              سنستجيب لطلبك خلال 7 ايام عمل.
            </p>
            <Link href="/chat">
              <Button className="bg-maroon hover:bg-maroon-dark text-white">
                ابدأ المحادثة
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
