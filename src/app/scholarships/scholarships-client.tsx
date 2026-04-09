"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowRight,
  Award,
  Building2,
  GraduationCap,
  Globe,
  CheckCircle,
  ExternalLink,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { University } from "@/types/university";
import type { GovernmentScholarship } from "./page";

/* ── Major categories for matching ── */
const MAJOR_CATEGORIES = [
  { key: "all", label: "الكل" },
  { key: "engineering", label: "هندسة" },
  { key: "cs", label: "حاسوب" },
  { key: "medicine", label: "طب" },
  { key: "business", label: "أعمال" },
  { key: "law", label: "قانون" },
  { key: "education", label: "تربية" },
  { key: "arts", label: "فنون" },
  { key: "science", label: "علوم" },
] as const;

type MajorCategory = (typeof MAJOR_CATEGORIES)[number]["key"];

/* ── Keywords per category for matching ── */
const MAJOR_KEYWORDS: Record<string, string[]> = {
  engineering: ["هندسة", "بترول", "كيميائية", "مدنية", "كهربائية", "ميكانيكية", "معمارية", "صناعية"],
  cs: ["حاسوب", "برمجيات", "ذكاء اصطناعي", "نظم معلومات", "أمن سيبراني", "علوم الحاسوب", "تقنية", "بيانات"],
  medicine: ["طب", "صيدلة", "تمريض", "صحة", "أسنان", "طبية"],
  business: ["أعمال", "محاسبة", "تمويل", "اقتصاد", "إدارة", "تسويق"],
  law: ["قانون", "حقوق", "شريعة"],
  education: ["تربية", "تعليم", "معلم"],
  arts: ["فنون", "تصميم", "غرافيك", "إعلام", "صحافة"],
  science: ["علوم", "رياضيات", "فيزياء", "كيمياء", "أحياء", "إحصاء", "بيئية"],
};

interface ScholarshipsClientProps {
  universities: [string, University][];
  governmentScholarships: Record<string, GovernmentScholarship>;
}

/* ── Match eligibility helper ── */
function getEligibility(
  scholarship: GovernmentScholarship,
  nationality: "qatari" | "non_qatari" | "all",
  gpa: number | null,
  major: MajorCategory
): "eligible" | "possible" | "none" {
  let natMatch = true;
  let gpaMatch = true;
  let majorMatch = true;

  // Nationality check
  if (nationality !== "all") {
    if (nationality === "qatari") {
      natMatch =
        scholarship.eligibility.includes("قطري") ||
        scholarship.eligibility.includes("جميع");
    } else {
      natMatch =
        scholarship.eligibility.includes("جميع") ||
        !scholarship.eligibility.includes("قطريون فقط");
    }
  }

  // GPA check
  if (gpa !== null && scholarship.gpaRequired) {
    gpaMatch = gpa >= scholarship.gpaRequired;
  }

  // Major check
  if (major !== "all" && scholarship.tracks && scholarship.tracks.length > 0) {
    const keywords = MAJOR_KEYWORDS[major] || [];
    majorMatch = scholarship.tracks.some((track) =>
      keywords.some((kw) => track.includes(kw))
    );
  }

  if (!natMatch) return "none";
  if (natMatch && gpaMatch && majorMatch) return "eligible";
  if (natMatch) return "possible";
  return "none";
}

/* ── Match university scholarship helper ── */
function getUniEligibility(
  uni: { scholarships: Record<string, unknown>; type: string },
  nationality: "qatari" | "non_qatari" | "all"
): "eligible" | "possible" {
  if (nationality === "all") return "eligible";

  const schStr = JSON.stringify(uni.scholarships).toLowerCase();
  if (nationality === "qatari") {
    if (schStr.includes("قطري") || schStr.includes("حكومي") || schStr.includes("كامل"))
      return "eligible";
  } else {
    if (schStr.includes("جميع") || schStr.includes("غير") || schStr.includes("need") || schStr.includes("merit"))
      return "eligible";
  }
  return "possible";
}

export default function ScholarshipsClient({
  universities,
  governmentScholarships,
}: ScholarshipsClientProps) {
  const [nationality, setNationality] = useState<"all" | "qatari" | "non_qatari">("all");
  const [gpaInput, setGpaInput] = useState<string>("");
  const [selectedMajor, setSelectedMajor] = useState<MajorCategory>("all");
  const [smartFilterOpen, setSmartFilterOpen] = useState(false);

  const gpa = gpaInput ? parseFloat(gpaInput) : null;
  const isFiltering = nationality !== "all" || gpa !== null || selectedMajor !== "all";

  // Extract university scholarships
  const universityScholarships = universities
    .filter(([, uni]) => uni.scholarships)
    .map(([id, uni]) => ({
      id,
      nameAr: uni.nameAr,
      nameEn: uni.nameEn,
      type: uni.type,
      scholarships: uni.scholarships as Record<string, unknown>,
    }));

  // Filter government scholarships with eligibility
  const filteredGovScholarships = useMemo(() => {
    return Object.entries(governmentScholarships)
      .map(([key, s]) => ({
        key,
        scholarship: s,
        eligibility: getEligibility(s, nationality, gpa, selectedMajor),
      }))
      .filter((item) => {
        if (!isFiltering) return true;
        return item.eligibility !== "none";
      })
      .sort((a, b) => {
        if (a.eligibility === "eligible" && b.eligibility !== "eligible") return -1;
        if (a.eligibility !== "eligible" && b.eligibility === "eligible") return 1;
        return 0;
      });
  }, [governmentScholarships, nationality, gpa, selectedMajor, isFiltering]);

  // Filter university scholarships
  const filteredUniScholarships = useMemo(() => {
    return universityScholarships
      .map((uni) => ({
        ...uni,
        eligibility: getUniEligibility(uni, nationality),
      }))
      .sort((a, b) => {
        if (a.eligibility === "eligible" && b.eligibility !== "eligible") return -1;
        if (a.eligibility !== "eligible" && b.eligibility === "eligible") return 1;
        return 0;
      });
  }, [universityScholarships, nationality]);

  return (
    <div className="min-h-dvh bg-background">
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
            <Award className="h-5 w-5 text-gold" />
            <div>
              <h1 className="text-xl font-bold">المنح الدراسية</h1>
              <p className="text-[13px] text-white/65">
                جميع المنح المتاحة في قطر
              </p>
            </div>
          </div>

          {/* Smart filter toggle */}
          <button
            onClick={() => setSmartFilterOpen(!smartFilterOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors mb-3"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gold" />
              <span className="text-[13px] font-semibold">اكتشف المنح المناسبة لك</span>
            </div>
            <SlidersHorizontal className="h-4 w-4 text-white/60" />
          </button>

          {/* Smart matching filter panel */}
          {smartFilterOpen && (
            <div className="space-y-3 p-4 rounded-xl bg-white/8 border border-white/10">
              {/* Nationality */}
              <div>
                <label className="text-[11px] text-white/60 font-bold mb-1.5 block">الجنسية</label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNationality("all")}
                    className={`rounded-xl text-[12px] h-8 ${
                      nationality === "all"
                        ? "bg-white/20 text-white"
                        : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5 ml-1" />
                    الكل
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNationality("qatari")}
                    className={`rounded-xl text-[12px] h-8 ${
                      nationality === "qatari"
                        ? "bg-gold/20 text-gold-light border border-gold/50"
                        : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    قطري
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNationality("non_qatari")}
                    className={`rounded-xl text-[12px] h-8 ${
                      nationality === "non_qatari"
                        ? "bg-white/20 text-white"
                        : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    مقيم
                  </Button>
                </div>
              </div>

              {/* GPA */}
              <div>
                <label className="text-[11px] text-white/60 font-bold mb-1.5 block">المعدل (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={gpaInput}
                  onChange={(e) => setGpaInput(e.target.value)}
                  placeholder="مثال: 85"
                  className="w-full h-9 px-3 rounded-xl bg-white/10 border border-white/15 text-white text-[13px] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </div>

              {/* Major */}
              <div>
                <label className="text-[11px] text-white/60 font-bold mb-1.5 block">التخصص</label>
                <div className="flex flex-wrap gap-1.5">
                  {MAJOR_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.key}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMajor(cat.key)}
                      className={`rounded-xl text-[11px] h-7 px-3 ${
                        selectedMajor === cat.key
                          ? "bg-gold/20 text-gold-light border border-gold/50"
                          : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filter status */}
              {isFiltering && (
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-white/50">
                    يتم عرض المنح المتاحة لك فقط
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNationality("all");
                      setGpaInput("");
                      setSelectedMajor("all");
                    }}
                    className="text-[11px] h-6 text-white/50 hover:text-white hover:bg-white/10"
                  >
                    مسح الفلتر
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Legacy nationality filter when smart filter is closed */}
          {!smartFilterOpen && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNationality("all")}
                className={`rounded-xl text-[12px] h-8 ${
                  nationality === "all"
                    ? "bg-white/20 text-white"
                    : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Globe className="h-3.5 w-3.5 ml-1" />
                الكل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNationality("qatari")}
                className={`rounded-xl text-[12px] h-8 ${
                  nationality === "qatari"
                    ? "bg-gold/20 text-gold-light border border-gold/50"
                    : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                قطري
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNationality("non_qatari")}
                className={`rounded-xl text-[12px] h-8 ${
                  nationality === "non_qatari"
                    ? "bg-white/20 text-white"
                    : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                مقيم
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="government">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="government" className="flex-1 gap-1.5">
              <GraduationCap className="h-4 w-4" />
              المنح الحكومية
            </TabsTrigger>
            <TabsTrigger value="university" className="flex-1 gap-1.5">
              <Building2 className="h-4 w-4" />
              منح الجامعات
            </TabsTrigger>
          </TabsList>

          {/* Government Scholarships */}
          <TabsContent value="government">
            <div className="space-y-4">
              {filteredGovScholarships.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    لا توجد منح متاحة لهذا التصنيف
                  </p>
                </div>
              ) : (
                filteredGovScholarships.map(({ key, scholarship, eligibility: elig }) => (
                  <Card key={key} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Award className="h-4 w-4 text-gold flex-shrink-0" />
                          {scholarship.nameAr}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isFiltering && elig === "eligible" && (
                            <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                              <CheckCircle className="h-3 w-3 ml-0.5" />
                              مؤهل
                            </Badge>
                          )}
                          {isFiltering && elig === "possible" && (
                            <Badge className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                              ممكن
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            {scholarship.eligibility.includes("قطري")
                              ? "قطريين"
                              : "جميع الجنسيات"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        {scholarship.provider}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Coverage */}
                      <div>
                        <h4 className="text-[12px] font-bold text-muted-foreground mb-1.5">
                          التغطية
                        </h4>
                        {Array.isArray(scholarship.coverage) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {scholarship.coverage.map((item) => (
                              <Badge
                                key={item}
                                variant="secondary"
                                className="text-[11px] font-normal gap-1"
                              >
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                {item}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[13px] text-foreground">
                            {scholarship.coverage}
                          </p>
                        )}
                      </div>

                      {/* Eligibility */}
                      <div>
                        <h4 className="text-[12px] font-bold text-muted-foreground mb-1">
                          الاهلية
                        </h4>
                        <p className="text-[13px] text-foreground">
                          {scholarship.eligibility}
                        </p>
                      </div>

                      {/* GPA */}
                      {scholarship.gpaRequired && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[13px]">
                            الحد الادنى للمعدل: {scholarship.gpaRequired}%
                          </span>
                          {gpa !== null && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                gpa >= scholarship.gpaRequired
                                  ? "text-green-600 border-green-300 dark:text-green-400 dark:border-green-700"
                                  : "text-red-600 border-red-300 dark:text-red-400 dark:border-red-700"
                              }`}
                            >
                              {gpa >= scholarship.gpaRequired ? "معدلك كافٍ" : "معدلك أقل"}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Tracks */}
                      {scholarship.tracks && (
                        <div>
                          <h4 className="text-[12px] font-bold text-muted-foreground mb-1">
                            التخصصات
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {scholarship.tracks.map((track) => (
                              <Badge
                                key={track}
                                variant="outline"
                                className="text-[11px] font-normal"
                              >
                                {track}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deadline */}
                      {scholarship.deadline && (
                        <p className="text-[12px] text-muted-foreground">
                          الموعد النهائي: {scholarship.deadline}
                        </p>
                      )}

                      {/* Link */}
                      {(scholarship.applicationUrl || scholarship.website) && (
                        <a
                          href={scholarship.applicationUrl || scholarship.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-maroon dark:text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          الموقع الرسمي
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* University Scholarships */}
          <TabsContent value="university">
            <div className="space-y-4">
              {filteredUniScholarships.map((uni) => (
                <Card
                  key={uni.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">
                          {uni.nameAr}
                        </CardTitle>
                        <p className="text-[12px] text-muted-foreground">
                          {uni.nameEn}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isFiltering && uni.eligibility === "eligible" && (
                          <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                            <CheckCircle className="h-3 w-3 ml-0.5" />
                            مؤهل
                          </Badge>
                        )}
                        {isFiltering && uni.eligibility === "possible" && (
                          <Badge className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                            ممكن
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          {uni.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {typeof uni.scholarships === "string" ? (
                        <p className="text-[13px] text-foreground">
                          {uni.scholarships}
                        </p>
                      ) : (
                        Object.entries(
                          uni.scholarships as Record<string, unknown>
                        ).map(([key, value]) => {
                          if (typeof value === "string") {
                            return (
                              <div key={key}>
                                <h4 className="text-[12px] font-bold text-muted-foreground mb-0.5">
                                  {key === "qatari"
                                    ? "للقطريين"
                                    : key === "nonQatari"
                                      ? "لغير القطريين"
                                      : key === "merit"
                                        ? "منح الجدارة"
                                        : key === "financial"
                                          ? "منح الحاجة المالية"
                                          : key}
                                </h4>
                                <p className="text-[13px]">{value}</p>
                              </div>
                            );
                          }
                          const scholarship = value as {
                            name?: string;
                            coverage?: string;
                            conditions?: string;
                          };
                          return (
                            <div
                              key={key}
                              className="p-3 rounded-lg bg-muted/50"
                            >
                              {scholarship.name && (
                                <h4 className="text-[13px] font-bold mb-1">
                                  {scholarship.name}
                                </h4>
                              )}
                              {scholarship.coverage && (
                                <p className="text-[12px] text-muted-foreground">
                                  التغطية: {scholarship.coverage}
                                </p>
                              )}
                              {scholarship.conditions && (
                                <p className="text-[12px] text-muted-foreground">
                                  الشروط: {scholarship.conditions}
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <Link href={`/universities/${uni.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[12px] h-8"
                        >
                          تفاصيل الجامعة
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
