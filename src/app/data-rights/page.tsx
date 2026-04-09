import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Scale, UserCheck, Trash2, Download, Ban, Send, Shield } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "حقوق البيانات | المستشار الجامعي القطري",
  description:
    "حقوق اصحاب البيانات وفق قانون حماية البيانات الشخصية القطري PDPPL",
};

const SECTIONS = [
  { id: "access", title: "حق الوصول" },
  { id: "correct", title: "حق التصحيح" },
  { id: "delete", title: "حق الحذف" },
  { id: "withdraw", title: "حق سحب الموافقة" },
  { id: "portability", title: "حق نقل البيانات" },
];

const RIGHTS = [
  {
    id: "access",
    icon: UserCheck,
    title: "حق الوصول",
    description: "يحق لك طلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك",
  },
  {
    id: "correct",
    icon: Send,
    title: "حق التصحيح",
    description: "يحق لك طلب تصحيح اي بيانات غير دقيقة او غير مكتملة",
  },
  {
    id: "delete",
    icon: Trash2,
    title: "حق الحذف",
    description: "يحق لك طلب حذف بياناتك الشخصية نهائيا",
  },
  {
    id: "withdraw",
    icon: Ban,
    title: "حق سحب الموافقة",
    description: "يحق لك سحب موافقتك على معالجة بياناتك في اي وقت",
  },
  {
    id: "portability",
    icon: Download,
    title: "حق نقل البيانات",
    description: "يحق لك الحصول على بياناتك بصيغة قابلة للقراءة آليا",
  },
];

export default function DataRightsPage() {
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
              <Scale className="h-4 w-4 text-maroon dark:text-primary" />
              جدول المحتويات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="flex flex-wrap gap-2">
              {SECTIONS.map((section, idx) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-maroon dark:hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-muted"
                >
                  <span>{idx + 1}. {section.title}</span>
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Header section */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">حقوقك محفوظة</h2>
          <p className="text-sm text-muted-foreground">
            وفق قانون حماية البيانات الشخصية القطري رقم 13 لسنة 2016 (PDPPL)
          </p>
        </div>

        {/* Rights cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {RIGHTS.map((right) => (
            <Card key={right.title} id={right.id} className="hover:shadow-md transition-shadow">
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

        {/* How to exercise rights */}
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
      <Footer />
    </div>
  );
}
