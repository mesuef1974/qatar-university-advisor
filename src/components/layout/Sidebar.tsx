"use client";

import Link from "next/link";
import { useChatStore } from "@/store/chat-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  MessageCircle,
  Building2,
  GitCompareArrows,
  Award,
  Calculator,
  Briefcase,
  Zap,
  HelpCircle,
  Shield,
  FileText,
  Scale,
} from "lucide-react";

const SECTIONS = [
  { label: "المحادثة", href: "/chat", icon: MessageCircle },
  { label: "الجامعات", href: "/universities", icon: Building2 },
  { label: "المقارنة", href: "/compare", icon: GitCompareArrows },
  { label: "المنح", href: "/scholarships", icon: Award },
  { label: "حاسبة القبول", href: "/calculator", icon: Calculator },
  { label: "المسارات المهنية", href: "/careers", icon: Briefcase },
];

const TOP_QUESTIONS = [
  "جميع الجامعات",
  "شروط القبول في جامعة قطر",
  "المنح والابتعاث",
  "الكليات العسكرية",
  "الرواتب والوظائف",
  "جامعات المدينة التعليمية",
];

const QUICK_BUTTONS = [
  { label: "جميع الجامعات", query: "جميع الجامعات", icon: Building2 },
  { label: "المنح الدراسية", query: "المنح والابتعاث", icon: Award },
  { label: "اختبار التخصص", query: "اختبار التخصص", icon: Zap },
];

interface SidebarProps {
  onSendMessage: (text: string) => void;
}

export default function Sidebar({ onSendMessage }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, setActiveView } = useChatStore();

  const handleQuickAction = (query: string) => {
    onSendMessage(query);
    setActiveView("chat");
    setSidebarOpen(false);
  };

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="right" className="w-[300px] p-0 overflow-y-auto">
        {/* Header */}
        <SheetHeader className="bg-gradient-to-l from-maroon to-maroon-dark text-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/logo-192.png"
                alt="المستشار الجامعي القطري"
                width={36}
                height={36}
                unoptimized
                className="object-contain rounded-lg"
              />
            </div>
            <div>
              <SheetTitle className="text-white font-bold text-[15px]">
                المستشار الجامعي القطري
              </SheetTitle>
              <p className="text-[11px] text-white/65">
                v2.0 | قاعدة معرفة شاملة
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Quick access */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground mb-3">
            <Zap className="h-3.5 w-3.5 text-gold" />
            وصول سريع
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_BUTTONS.map((btn) => (
              <button
                key={btn.query}
                onClick={() => handleQuickAction(btn.query)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-maroon-light dark:bg-maroon/10 text-maroon dark:text-primary border border-maroon/15 text-[12px] font-semibold hover:bg-maroon/10 dark:hover:bg-maroon/20 transition-colors cursor-pointer"
              >
                <btn.icon className="h-3.5 w-3.5" />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* FAQ */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-gold" />
            اسئلة شائعة
          </div>
          <div className="space-y-0.5">
            {TOP_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickAction(q)}
                className="w-full text-right px-3 py-2.5 rounded-lg text-[13px] text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Sections */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground mb-2">
            الاقسام
          </div>
          <div className="space-y-0.5">
            {SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center gap-2 text-right px-3 py-2.5 rounded-lg text-[13px] text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <section.icon className="h-4 w-4 text-maroon" />
                {section.label}
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* Legal links */}
        <div className="p-4 mt-auto">
          <div className="text-[11px] font-bold text-muted-foreground mb-2 tracking-wide">
            معلومات قانونية
          </div>
          <div className="space-y-0.5">
            <Link
              href="/privacy"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Shield className="h-3.5 w-3.5" />
              سياسة الخصوصية
            </Link>
            <Link
              href="/terms"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <FileText className="h-3.5 w-3.5" />
              شروط الاستخدام
            </Link>
            <Link
              href="/data-rights"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Scale className="h-3.5 w-3.5" />
              حقوق البيانات
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-4">
            &copy; 2026 شركة أذكياء للبرمجيات | Azkia Software Co.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
