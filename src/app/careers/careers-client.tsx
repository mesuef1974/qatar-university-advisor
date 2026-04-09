"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Briefcase,
  TrendingUp,
  Building2,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import type { CareersMap } from "./page";

/* ── Category icons/emojis ── */
const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  engineering: { icon: "🔧", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  medicine: { icon: "🩺", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  business: { icon: "📊", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  law: { icon: "⚖️", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  it: { icon: "💻", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  education: { icon: "📚", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  media: { icon: "🎬", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  arts: { icon: "🎨", color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400" },
};

/* ── Demand badge color ── */
function getDemandStyle(demand: string) {
  if (demand.includes("عالي جداً"))
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
  if (demand.includes("عالي"))
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  if (demand.includes("متوسط"))
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
}

/* ── University ID to Arabic name map ── */
const UNI_NAMES: Record<string, string> = {
  QU: "جامعة قطر",
  CMU_Q: "كارنيغي ميلون",
  TAMU_Q: "تكساس إي آند إم",
  WCM_Q: "وايل كورنيل",
  NU_Q: "نورث ويسترن",
  GU_Q: "جورجتاون",
  VCU_Q: "فرجينيا كومنولث",
  HBKU: "حمد بن خليفة",
  HEC_Q: "HEC Paris",
  UDST: "UDST",
  ORYX_LJMU: "Oryx-LJMU",
  AFG_ABERDEEN: "أبردين",
  ASTATE_Q: "أركنساس",
};

interface CareersClientProps {
  careers: CareersMap;
}

export default function CareersClient({ careers }: CareersClientProps) {
  const categories = Object.entries(careers);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.[0] ?? "");

  const currentCategory = careers[selectedCategory];

  return (
    <PageLayout>
    <div className="bg-background">
      {/* Header */}
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/chat">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Briefcase className="h-5 w-5 text-gold" />
            <div>
              <h1 className="text-xl font-bold">المسارات المهنية</h1>
              <p className="text-[13px] text-white/65">
                اكتشف الوظائف والرواتب في سوق قطر
              </p>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(([key, cat]) => {
              const meta = CATEGORY_META[key] || { icon: "📋", color: "" };
              return (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className={`rounded-xl text-[12px] h-8 gap-1 ${
                    selectedCategory === key
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <span>{meta.icon}</span>
                  {cat.nameAr}
                </Button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {currentCategory && (
          <div className="space-y-4">
            {/* Section title */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {CATEGORY_META[selectedCategory]?.icon || "📋"}
              </span>
              <h2 className="text-lg font-bold text-foreground">
                {currentCategory.nameAr}
              </h2>
              <span className="text-[12px] text-muted-foreground">
                ({currentCategory.paths.length} مسار وظيفي)
              </span>
            </div>

            {/* Career cards */}
            {currentCategory.paths.map((career, idx) => (
              <Card
                key={idx}
                className="hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-maroon dark:text-primary flex-shrink-0" />
                      <span>{career.title}</span>
                    </CardTitle>
                    <Badge
                      className={`text-[10px] flex-shrink-0 ${getDemandStyle(career.demand)}`}
                    >
                      <TrendingUp className="h-3 w-3 ml-0.5" />
                      {career.demand}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    {career.titleEn}
                  </p>
                  <p className="text-[13px] text-foreground mt-1">
                    {career.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Salary section */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <DollarSign className="h-3.5 w-3.5 text-gold" />
                      <h4 className="text-[12px] font-bold text-muted-foreground">
                        الراتب ({career.currency})
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Entry */}
                      <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">مبتدئ</p>
                        <p className="text-[13px] font-bold text-foreground">
                          {career.salaryRange.entry}
                        </p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[33%] rounded-full bg-emerald-400 dark:bg-emerald-500" />
                        </div>
                      </div>
                      {/* Mid */}
                      <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">متوسط</p>
                        <p className="text-[13px] font-bold text-foreground">
                          {career.salaryRange.mid}
                        </p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[66%] rounded-full bg-blue-400 dark:bg-blue-500" />
                        </div>
                      </div>
                      {/* Senior */}
                      <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">خبير</p>
                        <p className="text-[13px] font-bold text-foreground">
                          {career.salaryRange.senior}
                        </p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-full rounded-full bg-violet-400 dark:bg-violet-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Employers */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <h4 className="text-[12px] font-bold text-muted-foreground">
                        أبرز أصحاب العمل
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {career.topEmployers.map((emp) => (
                        <Badge
                          key={emp}
                          variant="secondary"
                          className="text-[11px] font-normal"
                        >
                          {emp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Related Majors */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                      <h4 className="text-[12px] font-bold text-muted-foreground">
                        التخصصات المرتبطة
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {career.relatedMajors.map((major) => (
                        <Badge
                          key={major}
                          variant="outline"
                          className="text-[11px] font-normal"
                        >
                          {major}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Universities */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Building2 className="h-3.5 w-3.5 text-maroon dark:text-primary" />
                      <h4 className="text-[12px] font-bold text-muted-foreground">
                        الجامعات
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {career.universities.map((uniId) => (
                        <Link
                          key={uniId}
                          href={`/universities/${uniId}`}
                        >
                          <Badge
                            variant="outline"
                            className="text-[11px] font-normal text-maroon dark:text-primary border-maroon/30 dark:border-primary/30 hover:bg-maroon/5 dark:hover:bg-primary/10 cursor-pointer"
                          >
                            {UNI_NAMES[uniId] || uniId}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
    </PageLayout>
  );
}
