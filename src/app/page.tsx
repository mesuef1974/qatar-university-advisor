import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import LandingFooter from "@/components/layout/LandingFooter";
import {
  MessageCircle,
  Building2,
  Calculator,
  GraduationCap,
  Briefcase,
  GitCompareArrows,
  Award,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const STATS = [
  {
    icon: Building2,
    value: "30",
    label: "جامعة ومؤسسة",
  },
  {
    icon: BookOpen,
    value: "156+",
    label: "تخصص أكاديمي",
  },
  {
    icon: Briefcase,
    value: "13+",
    label: "مسار مهني",
  },
  {
    icon: Award,
    value: "منح",
    label: "وابتعاث",
  },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "المحادثة الذكية",
    description: "اسأل أي سؤال عن الجامعات والتخصصات واحصل على إجابة فورية",
    cta: "ابدأ محادثة",
    href: "/chat",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Building2,
    title: "دليل الجامعات",
    description: "30 جامعة ومؤسسة مع تفاصيل كاملة وشعارات وشروط القبول",
    cta: "تصفح الجامعات",
    href: "/universities",
    color: "text-maroon dark:text-primary",
    bg: "bg-maroon-light dark:bg-primary/10",
  },
  {
    icon: Calculator,
    title: "حاسبة القبول",
    description: "أدخل معدلك واكتشف الجامعات والتخصصات المتاحة لك",
    cta: "احسب الآن",
    href: "/calculator",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: GraduationCap,
    title: "المنح والابتعاث",
    description: "اكتشف المنح المناسبة لك حسب جنسيتك ومعدلك",
    cta: "استكشف المنح",
    href: "/scholarships",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Briefcase,
    title: "المسارات المهنية",
    description: "من التخصص الجامعي إلى الوظيفة المتوقعة والراتب",
    cta: "استكشف المسارات",
    href: "/careers",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: GitCompareArrows,
    title: "المقارنة الذكية",
    description: "قارن حتى 3 جامعات جنبًا إلى جنب بكل التفاصيل",
    cta: "قارن الآن",
    href: "/compare",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
];

const STEPS = [
  {
    step: 1,
    title: "اختر جنسيتك",
    description: "قطري/ة أو مقيم/ة — لنخصص النتائج لك",
  },
  {
    step: 2,
    title: "اسأل عن أي جامعة أو تخصص",
    description: "اكتب سؤالك بالعربية واحصل على إجابة فورية",
  },
  {
    step: 3,
    title: "احصل على إجابة دقيقة",
    description: "معلومات محدثة من مصادر رسمية مع روابط مباشرة",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />

      {/* ========== Hero Section ========== */}
      <section className="relative bg-gradient-to-bl from-maroon via-maroon-dark to-[#4a0a1f] overflow-hidden">
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-0 left-0 w-72 h-72 bg-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 text-center">
          {/* Logo */}
          <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl bg-white p-2 shadow-xl border-2 border-white/30 flex items-center justify-center overflow-hidden mb-8">
            <Image
              src="/logo-192.png"
              alt="المستشار الجامعي القطري"
              width={120}
              height={120}
              unoptimized
              className="object-contain rounded-xl"
              priority
            />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            المستشار الجامعي القطري
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            مُرشدك الذكي لاختيار الجامعة والتخصص في قطر.
            <br className="hidden sm:block" />
            معلومات شاملة ومحدثة عن 30 مؤسسة تعليمية.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat">
              <Button
                size="lg"
                className="bg-white text-maroon hover:bg-white/90 rounded-xl px-8 py-3 text-base font-bold shadow-lg min-w-[180px]"
              >
                ابدأ الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/universities">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8 py-3 text-base font-bold min-w-[180px] bg-transparent"
              >
                استكشف الجامعات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Stats Bar ========== */}
      <section className="relative -mt-8 z-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="bg-card shadow-lg border-border/50 py-0"
                >
                  <CardContent className="flex flex-col items-center justify-center py-5 sm:py-6 px-3">
                    <Icon className="h-7 w-7 text-maroon dark:text-primary mb-2" />
                    <span className="text-2xl sm:text-3xl font-bold text-maroon dark:text-primary">
                      {stat.value}
                    </span>
                    <span className="text-[12px] sm:text-[13px] text-muted-foreground mt-1">
                      {stat.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== Features Grid ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              كل ما تحتاجه في مكان واحد
            </h2>
            <p className="text-muted-foreground text-[15px] max-w-xl mx-auto">
              أدوات ذكية تساعدك في اتخاذ القرار الأكاديمي الصحيح
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.href}
                  className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-maroon/20 dark:hover:border-primary/20 py-0"
                >
                  <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-bold text-[16px] text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed flex-1 mb-4">
                      {feature.description}
                    </p>
                    <Link href={feature.href}>
                      <Button
                        variant="ghost"
                        className="text-maroon dark:text-primary hover:bg-maroon-light dark:hover:bg-primary/10 rounded-xl text-[13px] font-bold px-0 group-hover:px-3 transition-all"
                      >
                        {feature.cta}
                        <ArrowLeft className="mr-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== How It Works ========== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              كيف يعمل؟
            </h2>
            <p className="text-muted-foreground text-[15px]">
              ثلاث خطوات بسيطة للحصول على المعلومة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-maroon dark:bg-primary text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">
                  {step.step}
                </div>
                <h3 className="font-bold text-[16px] text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Final CTA ========== */}
      <section className="bg-gradient-to-bl from-maroon via-maroon-dark to-[#4a0a1f] py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            جاهز لاكتشاف مستقبلك الأكاديمي؟
          </h2>
          <p className="text-white/70 text-[15px] mb-8 max-w-lg mx-auto">
            ابدأ الآن واحصل على إرشاد أكاديمي ذكي ومجاني بالكامل
          </p>
          <Link href="/chat">
            <Button
              size="lg"
              className="bg-white text-maroon hover:bg-white/90 rounded-xl px-10 py-3 text-base font-bold shadow-lg"
            >
              ابدأ الآن — مجاني
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <LandingFooter />
    </div>
  );
}
