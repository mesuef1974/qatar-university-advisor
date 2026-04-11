"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Calculator,
  GraduationCap,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import type { University } from "@/types/university";

interface CalculatorClientProps {
  universities: [string, University][];
}

type Nationality = "qatari" | "non_qatari";
type Track = "scientific" | "literary" | "technological";
type MatchLevel = "excellent" | "good" | "possible" | "unlikely";

interface CalculatorResult {
  id: string;
  university: University;
  matchLevel: MatchLevel;
  matchScore: number;
  reason: string;
  minGPA: number | null;
}

const TRACK_DATA_KEY: Record<Track, string> = {
  scientific: "scientificTrack",
  literary: "literaryTrack",
  technological: "technologicalTrack",
};

// Extract a numeric GPA from various data shapes
function extractMinGPA(
  uni: University,
  nationality: Nationality,
  track: Track
): number | null {
  const req = uni.admissionRequirements;
  if (!req) return null;

  const trackKey = TRACK_DATA_KEY[track];

  // Structured qatari/nonQatari sub-objects
  if (nationality === "qatari" && req.qatari && typeof req.qatari === "object") {
    const qObj = req.qatari as Record<string, unknown>;
    // Try track-specific GPA first, then fall back to commercialTrack (for technological), then general minGPA
    const trackSection = qObj[trackKey] ?? qObj["commercialTrack"];
    if (trackSection && typeof trackSection === "object") {
      const ts = trackSection as Record<string, unknown>;
      if (typeof ts.minGPA === "number") return ts.minGPA;
      if (typeof ts.minGPA === "string") {
        const m = ts.minGPA.match(/(\d+)/);
        if (m) return parseInt(m[1], 10);
      }
    }
    if (typeof qObj.minGPA === "number") return qObj.minGPA;
    if (typeof qObj.minGPA === "string") {
      const m = qObj.minGPA.match(/(\d+)/);
      if (m) return parseInt(m[1], 10);
    }
  }

  if (nationality === "non_qatari") {
    if (req.nonQatari && typeof req.nonQatari === "object") {
      const nqObj = req.nonQatari as Record<string, unknown>;
      if (typeof nqObj.minGPA === "number") return nqObj.minGPA;
      if (typeof nqObj.minGPA === "string") {
        const m = nqObj.minGPA.match(/(\d+)/);
        if (m) return parseInt(m[1], 10);
      }
    }
    // Fallback: use qatari GPA for non_qatari if nonQatari section is missing
    if (req.qatari?.minGPA) return req.qatari.minGPA;
  }

  // String-based gpa field — extract first number
  const raw = req as Record<string, unknown>;
  if (typeof raw.gpa === "string") {
    const m = (raw.gpa as string).match(/(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  if (typeof raw.gpa === "number") {
    return raw.gpa as number;
  }

  return null;
}

function computeMatch(
  gpa: number,
  minGPA: number
): { level: MatchLevel; score: number; reason: string } {
  const diff = gpa - minGPA;
  if (diff >= 15) {
    return {
      level: "excellent",
      score: 95,
      reason: `معدلك ${gpa}% يتجاوز الحد الادنى (${minGPA}%) بـ ${diff} درجة`,
    };
  }
  if (diff >= 5) {
    return {
      level: "good",
      score: 80,
      reason: `معدلك ${gpa}% اعلى من الحد الادنى (${minGPA}%) بـ ${diff} درجة`,
    };
  }
  if (diff >= 0) {
    return {
      level: "possible",
      score: 60,
      reason: `معدلك ${gpa}% يحقق الحد الادنى (${minGPA}%) بفارق بسيط (${diff} درجة)`,
    };
  }
  return {
    level: "unlikely",
    score: 20,
    reason: `معدلك ${gpa}% اقل من الحد الادنى (${minGPA}%) بـ ${Math.abs(diff)} درجة`,
  };
}

const MATCH_CONFIG: Record<
  MatchLevel,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  excellent: {
    label: "ممتاز",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  good: {
    label: "جيد",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  possible: {
    label: "ممكن",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  unlikely: {
    label: "صعب",
    color: "text-gray-500 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/40",
    borderColor: "border-gray-200 dark:border-gray-700",
  },
};

const NATIONALITY_OPTIONS: { value: Nationality; label: string }[] = [
  { value: "qatari", label: "قطري" },
  { value: "non_qatari", label: "مقيم" },
];

const TRACK_OPTIONS: { value: Track; label: string }[] = [
  { value: "scientific", label: "علمي" },
  { value: "literary", label: "ادبي" },
  { value: "technological", label: "تكنولوجي" },
];

export default function CalculatorClient({
  universities,
}: CalculatorClientProps) {
  const [gpaInput, setGpaInput] = useState("");
  const [nationality, setNationality] = useState<Nationality>("qatari");
  const [track, setTrack] = useState<Track>("scientific");

  const gpa = gpaInput ? parseFloat(gpaInput) : null;

  const results = useMemo<CalculatorResult[]>(() => {
    if (gpa === null || isNaN(gpa) || gpa < 0 || gpa > 100) return [];

    const items: CalculatorResult[] = [];

    for (const [id, uni] of universities) {
      const minGPA = extractMinGPA(uni, nationality, track);

      if (minGPA === null) {
        // Show university without scoring
        items.push({
          id,
          university: uni,
          matchLevel: "possible",
          matchScore: 50,
          reason: "الحد الادنى غير محدد بدقة — راجع شروط القبول",
          minGPA: null,
        });
        continue;
      }

      const { level, score, reason } = computeMatch(gpa, minGPA);
      items.push({
        id,
        university: uni,
        matchLevel: level,
        matchScore: score,
        reason,
        minGPA,
      });
    }

    // Sort by matchScore descending, then by name
    items.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.university.nameAr.localeCompare(b.university.nameAr, "ar");
    });

    return items;
  }, [gpa, nationality, track, universities]);

  const counts = useMemo(() => {
    const c = { excellent: 0, good: 0, possible: 0, unlikely: 0 };
    results.forEach((r) => c[r.matchLevel]++);
    return c;
  }, [results]);

  return (
    <PageLayout>
    <div className="bg-background">
      {/* Header */}
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/chat">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-white p-1 shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/logo-192.png"
                alt="المستشار الجامعي القطري"
                width={40}
                height={40}
                unoptimized
                className="object-contain rounded-lg"
              />
            </div>
            <Calculator className="h-5 w-5 text-gold" />
            <div>
              <h1 className="text-xl font-bold">حاسبة القبول</h1>
              <p className="text-[13px] text-white/65">
                ادخل معدلك واكتشف الجامعات المناسبة
              </p>
            </div>
          </div>

          {/* GPA Input */}
          <div className="mb-4">
            <label className="text-[12px] text-white/70 font-semibold mb-1.5 block">
              المعدل التراكمي (من 100)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              placeholder="مثال: 85"
              value={gpaInput}
              onChange={(e) => setGpaInput(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 rounded-xl text-[15px] font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Nationality pills */}
          <div className="mb-3">
            <label className="text-[12px] text-white/70 font-semibold mb-1.5 block">
              الجنسية
            </label>
            <div className="flex gap-2">
              {NATIONALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNationality(opt.value)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-colors cursor-pointer ${
                    nationality === opt.value
                      ? "bg-gold text-maroon-dark"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Track pills */}
          <div>
            <label className="text-[12px] text-white/70 font-semibold mb-1.5 block">
              المسار الدراسي
            </label>
            <div className="flex gap-2">
              {TRACK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTrack(opt.value)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-colors cursor-pointer ${
                    track === opt.value
                      ? "bg-gold text-maroon-dark"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        {/* No GPA entered */}
        {(!gpa || isNaN(gpa)) && (
          <div className="text-center py-16">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">ادخل معدلك التراكمي</h2>
            <p className="text-muted-foreground text-sm">
              ادخل معدلك في الخانة اعلاه لعرض الجامعات المتاحة لك
            </p>
          </div>
        )}

        {/* Results */}
        {gpa !== null && !isNaN(gpa) && gpa >= 0 && gpa <= 100 && (
          <>
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {counts.excellent > 0 && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ممتاز: {counts.excellent}
                </Badge>
              )}
              {counts.good > 0 && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800 gap-1">
                  <TrendingUp className="h-3 w-3" />
                  جيد: {counts.good}
                </Badge>
              )}
              {counts.possible > 0 && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1">
                  <Minus className="h-3 w-3" />
                  ممكن: {counts.possible}
                </Badge>
              )}
              {counts.unlikely > 0 && (
                <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700 gap-1">
                  <TrendingDown className="h-3 w-3" />
                  صعب: {counts.unlikely}
                </Badge>
              )}
            </div>

            {/* Result cards */}
            <div className="space-y-3">
              {results.map((result) => {
                const config = MATCH_CONFIG[result.matchLevel];
                return (
                  <Card
                    key={result.id}
                    className={`border ${config.borderColor} overflow-hidden`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Logo */}
                        <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/10 border border-border flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                          {result.university.logoUrl ? (
                            <Image
                              src={result.university.logoUrl}
                              alt={result.university.nameAr}
                              width={36}
                              height={36}
                              unoptimized
                              className="object-contain"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-[14px] font-bold truncate">
                              {result.university.nameAr}
                            </h3>
                            <Badge
                              className={`text-[10px] font-bold px-2 py-0.5 ${config.color} ${config.bgColor} border ${config.borderColor}`}
                            >
                              {config.label}
                            </Badge>
                          </div>

                          <p className="text-[12px] text-muted-foreground mb-2">
                            {result.university.type} &mdash;{" "}
                            {result.university.location}
                          </p>

                          <p className={`text-[12px] ${config.color}`}>
                            {result.reason}
                          </p>

                          <div className="flex items-center gap-4 mt-3">
                            {result.minGPA !== null && (
                              <span className="text-[11px] text-muted-foreground">
                                الحد الادنى:{" "}
                                <span className="font-bold text-foreground">
                                  {result.minGPA}%
                                </span>
                              </span>
                            )}
                            {result.minGPA !== null && (
                              <span className="text-[11px] text-muted-foreground">
                                الفرق:{" "}
                                <span
                                  className={`font-bold ${
                                    gpa - result.minGPA >= 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-red-500 dark:text-red-400"
                                  }`}
                                >
                                  {gpa - result.minGPA >= 0 ? "+" : ""}
                                  {(gpa - result.minGPA).toFixed(1)}
                                </span>
                              </span>
                            )}
                            <Link
                              href={`/universities/${result.id}`}
                              className="mr-auto"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] gap-1 text-maroon dark:text-primary hover:bg-maroon/5"
                              >
                                التفاصيل
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
    </PageLayout>
  );
}
