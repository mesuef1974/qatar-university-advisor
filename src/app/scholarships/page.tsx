import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "المنح الدراسية | المستشار الجامعي القطري",
  description: "المنح الدراسية المتاحة في قطر للطلاب القطريين والمقيمين",
};

export default function ScholarshipsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/chat">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Award className="h-5 w-5 text-gold" />
          <h1 className="text-xl font-bold">المنح الدراسية</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2">قريبا</h2>
        <p className="text-muted-foreground text-sm mb-6">
          صفحة المنح التفصيلية قيد التطوير
        </p>
        <Link href="/chat">
          <Button className="bg-maroon hover:bg-maroon-dark text-white">
            اسأل عن المنح في المحادثة
          </Button>
        </Link>
      </main>
    </div>
  );
}
