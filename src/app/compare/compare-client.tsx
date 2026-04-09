"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  GitCompareArrows,
  Plus,
  X,
  GraduationCap,
  MapPin,
  Award,
  Building2,
  Globe,
  Banknote,
  Filter,
  Calendar,
  Trophy,
  Sparkles,
  Heart,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import type { University } from "@/types/university";

interface CompareClientProps {
  universities: [string, University][];
}

type SpecialtyFilter = "all" | "engineering" | "medicine" | "business" | "cs" | "law" | "arts" | "education";
type BudgetFilter = "all" | "free" | "under50k" | "under100k";
type GPAFilter = "all" | "70-80" | "80-90" | "90+";

const SPECIALTY_OPTIONS: { value: SpecialtyFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "engineering", label: "هندسة" },
  { value: "medicine", label: "طب" },
  { value: "business", label: "اعمال" },
  { value: "cs", label: "حاسوب" },
  { value: "law", label: "قانون" },
  { value: "arts", label: "فنون وتصميم" },
  { value: "education", label: "تربية" },
];

const BUDGET_OPTIONS: { value: BudgetFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "free", label: "مجاني" },
  { value: "under50k", label: "اقل من 50K" },
  { value: "under100k", label: "اقل من 100K" },
];

const GPA_OPTIONS: { value: GPAFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "70-80", label: "70-80" },
  { value: "80-90", label: "80-90" },
  { value: "90+", label: "90+" },
];

function matchesSpecialty(uni: University, filter: SpecialtyFilter): boolean {
  if (filter === "all") return true;
  const keywords: Record<string, string[]> = {
    engineering: ["هندسة", "Engineering"],
    medicine: ["طب", "Medicine", "صيدلة", "Pharmacy", "تمريض", "Nursing", "صح", "Health"],
    business: ["اعمال", "Business", "اقتصاد", "Economics", "ادارة", "Management", "محاسبة", "تسويق", "تمويل", "مال"],
    cs: ["حاسوب", "Computer", "معلومات", "Information", "ذكاء اصطناعي", "سيبراني", "Cyber"],
    law: ["قانون", "Law"],
    arts: ["فنون", "Arts", "تصميم", "Design", "إعلام", "اعلام", "افلام", "Film"],
    education: ["تربية", "Education", "تعليم"],
  };
  const kws = keywords[filter] || [];
  const text = JSON.stringify(uni.colleges || []) + " " + JSON.stringify((uni as Record<string, unknown>).programs || []) + " " + (uni.type || "") + " " + JSON.stringify(uni.keywords || []);
  return kws.some((kw) => text.includes(kw));
}

function matchesBudget(uni: University, filter: BudgetFilter): boolean {
  if (filter === "all") return true;
  const fees = uni.tuitionFees;
  if (!fees) return filter === "free";

  if (filter === "free") {
    if (typeof fees === "object" && "qatari" in fees && fees.qatari === 0) return true;
    const str = JSON.stringify(fees).toLowerCase();
    return str.includes("مجاني") || str.includes("free");
  }

  const str = JSON.stringify(fees);
  const nums = str.match(/(\d[\d,]*)/g);
  if (!nums) return true;

  const parsed = nums.map((n) => parseInt(n.replace(/,/g, ""), 10)).filter((n) => n > 1000);
  if (parsed.length === 0) return true;
  const minFee = Math.min(...parsed);

  if (filter === "under50k") return minFee < 50000;
  if (filter === "under100k") return minFee < 100000;
  return true;
}

function matchesGPA(uni: University, filter: GPAFilter): boolean {
  if (filter === "all") return true;
  const req = uni.admissionRequirements;
  if (!req) return true;

  let minGPA: number | null = null;
  if (req.qatari?.minGPA) minGPA = req.qatari.minGPA;
  else {
    const raw = req as Record<string, unknown>;
    if (typeof raw.gpa === "string") {
      const m = (raw.gpa as string).match(/(\d+)/);
      if (m) minGPA = parseInt(m[1], 10);
    }
  }

  if (minGPA === null) return true;

  if (filter === "70-80") return minGPA >= 60 && minGPA <= 80;
  if (filter === "80-90") return minGPA > 80 && minGPA <= 90;
  if (filter === "90+") return minGPA > 90;
  return true;
}

function extractNumericFee(uni: University): number | null {
  const fees = uni.tuitionFees;
  if (!fees) return null;
  if (typeof fees === "object" && "qatari" in fees) {
    const val = fees.qatari;
    if (typeof val === "number") return val;
  }
  const str = JSON.stringify(fees);
  const nums = str.match(/(\d[\d,]*)/g);
  if (!nums) return null;
  const parsed = nums.map((n) => parseInt(n.replace(/,/g, ""), 10)).filter((n) => n > 100);
  return parsed.length > 0 ? Math.min(...parsed) : null;
}

export default function CompareClient({ universities }: CompareClientProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyFilter>("all");
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>("all");
  const [gpaFilter, setGPAFilter] = useState<GPAFilter>("all");

  const addUniversity = (id: string) => {
    if (selected.length < 3 && !selected.includes(id)) {
      setSelected([...selected, id]);
    }
  };

  const removeUniversity = (id: string) => {
    setSelected(selected.filter((s) => s !== id));
  };

  const getUniversity = (id: string): University | undefined => {
    const entry = universities.find(([uid]) => uid === id);
    return entry ? entry[1] : undefined;
  };

  const filteredUniversities = useMemo(() => {
    return universities.filter(([, uni]) => {
      return (
        matchesSpecialty(uni, specialtyFilter) &&
        matchesBudget(uni, budgetFilter) &&
        matchesGPA(uni, gpaFilter)
      );
    });
  }, [universities, specialtyFilter, budgetFilter, gpaFilter]);

  const available = filteredUniversities.filter(([id]) => !selected.includes(id));

  const getDisplayName = (item: string | { name?: string; nameAr?: string; nameEn?: string }): string => {
    if (typeof item === 'string') return item;
    return item.name || item.nameAr || item.nameEn || '';
  };

  const getPrograms = (uni: University): string[] => {
    if (uni.colleges && uni.colleges.length > 0)
      return uni.colleges.map((c) => getDisplayName(c));
    const programs = (uni as Record<string, unknown>).programs;
    if (Array.isArray(programs))
      return programs.map((p: unknown) => getDisplayName(p as string | { name?: string; nameAr?: string; nameEn?: string }));
    return [];
  };

  const getTuitionQatari = (uni: University): string => {
    if (!uni.tuitionFees) return "غير محدد";
    const fees = uni.tuitionFees;
    if (typeof fees === "string") return fees;
    if ("qatari" in fees) {
      const val = fees.qatari;
      return val === 0 ? "مجاني" : `${val} ر.ق`;
    }
    return "غير محدد";
  };

  const getTuitionNonQatari = (uni: University): string => {
    if (!uni.tuitionFees) return "غير محدد";
    const fees = uni.tuitionFees;
    if (typeof fees === "string") return fees;
    if ("nonQatari" in fees) {
      const val = fees.nonQatari;
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        if (obj.perYear) return `${obj.perYear} ر.ق/سنة`;
        if (obj.perCredit) return `${obj.perCredit} ر.ق/ساعة`;
      }
      if (typeof val === "number") return `${val} ر.ق`;
    }
    if ("perYear" in fees) return `${fees.perYear} ر.ق/سنة`;
    if ("international" in fees) return `${fees.international}`;
    return "غير محدد";
  };

  const getGPA = (uni: University): string => {
    if (uni.admissionRequirements?.qatari?.minGPA) {
      return `${uni.admissionRequirements.qatari.minGPA}%+`;
    }
    const req = uni.admissionRequirements as Record<string, unknown> | undefined;
    if (req?.gpa) return String(req.gpa);
    return "غير محدد";
  };

  const getScholarshipSummary = (uni: University): string => {
    if (!uni.scholarships) return "غير متاح";
    if (typeof uni.scholarships === "string") return uni.scholarships;
    const entries = Object.values(uni.scholarships as Record<string, unknown>);
    return entries
      .map((v) => {
        if (typeof v === "string") return v;
        if (typeof v === "object" && v !== null) {
          const obj = v as { name?: string; coverage?: string };
          return obj.name || obj.coverage || "";
        }
        return "";
      })
      .filter(Boolean)
      .join(" | ");
  };

  const getLanguage = (uni: University): string => {
    if (uni.type.includes("أمريكية") || uni.type.includes("فرنسية") || uni.type.includes("بريطانية"))
      return "الانجليزية";
    if (uni.type.includes("حكومية"))
      return "العربية والانجليزية";
    return "الانجليزية";
  };

  const getDeadlines = (uni: University): string => {
    const raw = uni as Record<string, unknown>;
    if (raw.applicationDeadlines) {
      const dl = raw.applicationDeadlines;
      if (typeof dl === "string") return dl;
      if (typeof dl === "object" && dl !== null) {
        const vals = Object.values(dl as Record<string, string>);
        return vals.slice(0, 2).join(" | ");
      }
    }
    return "راجع موقع الجامعة";
  };

  const selectedUnis = selected
    .map((id) => {
      const uni = getUniversity(id);
      return uni ? { id, uni } : null;
    })
    .filter(Boolean) as { id: string; uni: University }[];

  // Compute badges
  const badges = useMemo(() => {
    if (selectedUnis.length < 2) return {};
    const result: Record<string, string[]> = {};
    selectedUnis.forEach(({ id }) => { result[id] = []; });

    // Cheapest
    const feePairs = selectedUnis.map(({ id, uni }) => ({ id, fee: extractNumericFee(uni) }));
    const withFees = feePairs.filter((p) => p.fee !== null);
    if (withFees.length > 0) {
      const minFee = Math.min(...withFees.map((p) => p.fee!));
      withFees.forEach((p) => {
        if (p.fee === minFee) {
          if (minFee === 0) {
            result[p.id].push("مجاني للقطريين");
          } else {
            result[p.id].push("الارخص");
          }
        }
      });
    }

    // Free for Qataris (secondary check)
    selectedUnis.forEach(({ id, uni }) => {
      const fee = extractNumericFee(uni);
      if (fee === 0 && !result[id].includes("مجاني للقطريين")) {
        result[id].push("مجاني للقطريين");
      }
    });

    // Most programs
    const programCounts = selectedUnis.map(({ id, uni }) => ({ id, count: getPrograms(uni).length }));
    const maxPrograms = Math.max(...programCounts.map((p) => p.count));
    if (maxPrograms > 0) {
      programCounts.forEach((p) => {
        if (p.count === maxPrograms && p.count > 1) {
          result[p.id].push("اكثر تخصصات");
        }
      });
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnis.map(s => s.id).join(",")]);

  const isCheapest = (uniId: string): boolean => {
    return badges[uniId]?.includes("الارخص") || badges[uniId]?.includes("مجاني للقطريين") || false;
  };

  const isMostExpensive = (uniId: string): boolean => {
    if (selectedUnis.length < 2) return false;
    const feePairs = selectedUnis.map(({ id, uni }) => ({ id, fee: extractNumericFee(uni) }));
    const withFees = feePairs.filter((p) => p.fee !== null && p.fee! > 0);
    if (withFees.length < 2) return false;
    const maxFee = Math.max(...withFees.map((p) => p.fee!));
    return feePairs.find((p) => p.id === uniId)?.fee === maxFee;
  };

  type CriterionRow = {
    label: string;
    icon: React.ReactNode;
    getValue: (uni: University) => string;
    highlight?: "fee";
  };

  const criteria: CriterionRow[] = [
    { label: "النوع", icon: <Building2 className="h-4 w-4" />, getValue: (uni) => uni.type },
    { label: "الموقع", icon: <MapPin className="h-4 w-4" />, getValue: (uni) => uni.location },
    { label: "الحد الادنى للمعدل", icon: <GraduationCap className="h-4 w-4" />, getValue: (uni) => getGPA(uni) },
    { label: "الرسوم (قطري)", icon: <Banknote className="h-4 w-4" />, getValue: (uni) => getTuitionQatari(uni), highlight: "fee" },
    { label: "الرسوم (مقيم)", icon: <Banknote className="h-4 w-4" />, getValue: (uni) => getTuitionNonQatari(uni) },
    { label: "المنح", icon: <Award className="h-4 w-4" />, getValue: (uni) => getScholarshipSummary(uni) },
    { label: "لغة التدريس", icon: <Globe className="h-4 w-4" />, getValue: (uni) => getLanguage(uni) },
    { label: "عدد البرامج/الكليات", icon: <GraduationCap className="h-4 w-4" />, getValue: (uni) => `${getPrograms(uni).length || "غير محدد"}` },
    { label: "مواعيد التقديم", icon: <Calendar className="h-4 w-4" />, getValue: (uni) => getDeadlines(uni) },
  ];

  const getLogoPath = (id: string): string => {
    return `/logos/${id}.png`;
  };

  return (
    <PageLayout>
    <div className="bg-background">
      {/* Header */}
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
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
            <GitCompareArrows className="h-5 w-5 text-gold" />
            <div>
              <h1 className="text-xl font-bold">مقارنة الجامعات</h1>
              <p className="text-[13px] text-white/65">
                اختر حتى 3 جامعات للمقارنة
              </p>
            </div>
          </div>

          {/* Smart Filters */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-semibold">
              <Filter className="h-3 w-3" />
              فلترة الجامعات
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SPECIALTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSpecialtyFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    specialtyFilter === opt.value
                      ? "bg-gold text-maroon-dark"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-white/50 self-center ml-1">الميزانية:</span>
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBudgetFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    budgetFilter === opt.value
                      ? "bg-gold text-maroon-dark"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <span className="text-[10px] text-white/50 self-center mr-2 ml-1">المعدل:</span>
              {GPA_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGPAFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    gpaFilter === opt.value
                      ? "bg-gold text-maroon-dark"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {(specialtyFilter !== "all" || budgetFilter !== "all" || gpaFilter !== "all") && (
              <p className="text-[11px] text-gold/80">
                {filteredUniversities.length} جامعة مطابقة للفلاتر
              </p>
            )}
          </div>

          {/* University selector */}
          <div className="flex flex-wrap gap-2 items-center">
            {selected.map((id) => {
              const uni = getUniversity(id);
              return (
                <Badge
                  key={id}
                  className="bg-white/15 text-white border-white/20 gap-1 py-1.5 px-3 text-[12px]"
                >
                  {uni?.nameAr}
                  <button
                    onClick={() => removeUniversity(id)}
                    className="mr-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {selected.length < 3 && (
              <Select onValueChange={(val: string | null) => { if (val) addUniversity(val); }}>
                <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white h-9 rounded-xl text-[12px]">
                  <SelectValue placeholder="اضف جامعة..." />
                </SelectTrigger>
                <SelectContent>
                  {available.map(([id, uni]) => (
                    <SelectItem key={id} value={id} className="text-[13px]">
                      {uni.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {selectedUnis.length === 0 ? (
          <div className="text-center py-16">
            <GitCompareArrows className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">اختر جامعات للمقارنة</h2>
            <p className="text-muted-foreground text-sm mb-6">
              اختر حتى 3 جامعات من القائمة اعلاه لمقارنتها
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {filteredUniversities.slice(0, 6).map(([id, uni]) => (
                <Button
                  key={id}
                  variant="outline"
                  size="sm"
                  onClick={() => addUniversity(id)}
                  className="text-[12px] h-8 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {uni.nameAr}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Badges Section */}
            {selectedUnis.length >= 2 && (
              <div className={`grid gap-3 ${selectedUnis.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {selectedUnis.map(({ id, uni }) => (
                  <Card key={id} className="text-center py-3">
                    <CardContent className="p-3 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        <Image
                          src={getLogoPath(id)}
                          alt={uni.nameAr}
                          width={48}
                          height={48}
                          className="object-contain"
                          unoptimized
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <h3 className="text-[13px] font-bold">{uni.nameAr}</h3>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {badges[id]?.map((badge) => (
                          <Badge
                            key={badge}
                            className={`text-[10px] gap-1 ${
                              badge === "مجاني للقطريين"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : badge === "الارخص"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : badge === "اكثر تخصصات"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                    : "bg-gold/20 text-maroon"
                            }`}
                          >
                            {badge === "مجاني للقطريين" && <Heart className="h-3 w-3" />}
                            {badge === "الارخص" && <Sparkles className="h-3 w-3" />}
                            {badge === "اكثر تخصصات" && <Trophy className="h-3 w-3" />}
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Professional Comparison Table */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitCompareArrows className="h-4 w-4 text-maroon dark:text-primary" />
                  جدول المقارنة التفصيلي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-right p-3 font-bold text-muted-foreground min-w-[140px]">المعيار</th>
                        {selectedUnis.map(({ id, uni }) => (
                          <th key={id} className="p-3 text-center min-w-[160px]">
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center overflow-hidden">
                                <Image
                                  src={getLogoPath(id)}
                                  alt={uni.nameAr}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                  unoptimized
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                              <span className="font-bold text-[12px]">{uni.nameAr}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map((criterion, idx) => (
                        <tr key={criterion.label} className={idx % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                          <td className="p-3 border-l">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-maroon dark:text-primary">{criterion.icon}</span>
                              <span className="font-semibold text-[12px]">{criterion.label}</span>
                            </div>
                          </td>
                          {selectedUnis.map(({ id, uni }) => {
                            const value = criterion.getValue(uni);
                            let cellClass = "p-3 text-center border-l";

                            if (criterion.highlight === "fee" && selectedUnis.length >= 2) {
                              if (isCheapest(id)) {
                                cellClass += " bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 font-bold";
                              } else if (isMostExpensive(id)) {
                                cellClass += " bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400";
                              }
                            }

                            return (
                              <td key={id} className={cellClass}>
                                <span className="text-[12px]">{value}</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Programs / Colleges */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-maroon dark:text-primary" />
                  التخصصات / الكليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`grid gap-4 ${
                    selectedUnis.length === 1
                      ? "grid-cols-1"
                      : selectedUnis.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                  }`}
                >
                  {selectedUnis.map(({ id, uni }) => (
                    <div key={id}>
                      <h4 className="text-[12px] font-bold text-muted-foreground mb-2">
                        {uni.nameAr}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {getPrograms(uni).map((p) => (
                          <Badge
                            key={p}
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {p}
                          </Badge>
                        ))}
                        {getPrograms(uni).length === 0 && (
                          <span className="text-[12px] text-muted-foreground">
                            غير محدد
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Links to detail pages */}
            <div className="flex flex-wrap gap-2 justify-center pt-4">
              {selectedUnis.map(({ id, uni }) => (
                <Link key={id} href={`/universities/${id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[12px] h-8"
                  >
                    تفاصيل {uni.nameAr}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
    </PageLayout>
  );
}
