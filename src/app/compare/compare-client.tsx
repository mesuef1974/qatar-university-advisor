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
} from "lucide-react";
import type { University } from "@/types/university";

interface CompareClientProps {
  universities: [string, University][];
}

export default function CompareClient({ universities }: CompareClientProps) {
  const [selected, setSelected] = useState<string[]>([]);

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

  // Get available universities (not already selected)
  const available = universities.filter(([id]) => !selected.includes(id));

  // Helper to extract programs/colleges as display names
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

  // Helper to extract tuition info
  const getTuition = (uni: University): string => {
    if (!uni.tuitionFees) return "غير محدد";
    const fees = uni.tuitionFees;
    if (typeof fees === "string") return fees;
    const parts: string[] = [];
    if ("qatari" in fees) {
      const val = fees.qatari;
      parts.push(`قطري: ${val === 0 ? "مجاني" : String(val)}`);
    }
    if ("nonQatari" in fees) {
      const val = fees.nonQatari;
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        if (obj.perYear) parts.push(`غير قطري: ${obj.perYear}`);
        else if (obj.perCredit) parts.push(`غير قطري: ${obj.perCredit}/ساعة`);
      }
    }
    if ("perYear" in fees) {
      parts.push(String(fees.perYear));
    }
    if ("international" in fees) {
      parts.push(`دولي: ${fees.international}`);
    }
    return parts.length > 0 ? parts.join(" | ") : "غير محدد";
  };

  // Helper to get GPA requirement
  const getGPA = (uni: University): string => {
    if (uni.admissionRequirements?.qatari?.minGPA) {
      return `${uni.admissionRequirements.qatari.minGPA}%+`;
    }
    const req = uni.admissionRequirements as Record<string, unknown> | undefined;
    if (req?.gpa) return String(req.gpa);
    return "غير محدد";
  };

  // Helper to get scholarships summary
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

  const selectedUnis = selected
    .map((id) => {
      const uni = getUniversity(id);
      return uni ? { id, uni } : null;
    })
    .filter(Boolean) as { id: string; uni: University }[];

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white">
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

            {/* Quick picks */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {universities.slice(0, 6).map(([id, uni]) => (
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
          <div className="space-y-4">
            {/* Comparison table as cards for mobile friendliness */}
            <CompareRow
              label="النوع"
              icon={<Building2 className="h-3.5 w-3.5" />}
              values={selectedUnis.map(({ uni }) => uni.type)}
            />
            <CompareRow
              label="الموقع"
              icon={<MapPin className="h-3.5 w-3.5" />}
              values={selectedUnis.map(({ uni }) => uni.location)}
            />
            <CompareRow
              label="الحد الادنى للمعدل"
              icon={<GraduationCap className="h-3.5 w-3.5" />}
              values={selectedUnis.map(({ uni }) => getGPA(uni))}
            />
            <CompareRow
              label="الرسوم الدراسية"
              icon={<Banknote className="h-3.5 w-3.5" />}
              values={selectedUnis.map(({ uni }) => getTuition(uni))}
            />
            <CompareRow
              label="المنح"
              icon={<Award className="h-3.5 w-3.5" />}
              values={selectedUnis.map(({ uni }) => getScholarshipSummary(uni))}
            />
            <CompareRow
              label="اللغة"
              icon={<Globe className="h-3.5 w-3.5" />}
              values={selectedUnis.map(({ uni }) =>
                uni.type.includes("أمريكية") || uni.type.includes("فرنسية")
                  ? "الانجليزية"
                  : uni.type.includes("حكومية")
                    ? "العربية والانجليزية"
                    : "العربية والانجليزية"
              )}
            />

            {/* Programs */}
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
  );
}

function CompareRow({
  label,
  icon,
  values,
}: {
  label: string;
  icon: React.ReactNode;
  values: string[];
}) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-[12px] font-bold text-muted-foreground">
            {label}
          </span>
        </div>
        <div
          className={`grid gap-3 ${
            values.length === 1
              ? "grid-cols-1"
              : values.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {values.map((value, i) => (
            <p key={i} className="text-[13px] text-foreground">
              {value}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
