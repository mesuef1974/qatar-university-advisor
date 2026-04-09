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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowRight,
  Award,
  Building2,
  GraduationCap,
  Globe,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import type { University } from "@/types/university";
import type { GovernmentScholarship } from "./page";

interface ScholarshipsClientProps {
  universities: [string, University][];
  governmentScholarships: Record<string, GovernmentScholarship>;
}

export default function ScholarshipsClient({
  universities,
  governmentScholarships,
}: ScholarshipsClientProps) {
  const [nationality, setNationality] = useState<"all" | "qatari" | "non_qatari">("all");

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

  // Filter government scholarships by nationality
  const filteredGovScholarships = Object.entries(governmentScholarships).filter(
    ([, s]) => {
      if (nationality === "all") return true;
      if (nationality === "qatari") {
        return (
          s.eligibility.includes("قطري") ||
          s.eligibility.includes("جميع")
        );
      }
      return (
        s.eligibility.includes("جميع") ||
        !s.eligibility.includes("قطريون فقط")
      );
    }
  );

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

          {/* Nationality filter */}
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
                filteredGovScholarships.map(([key, scholarship]) => (
                  <Card key={key} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Award className="h-4 w-4 text-gold flex-shrink-0" />
                          {scholarship.nameAr}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-[10px] flex-shrink-0"
                        >
                          {scholarship.eligibility.includes("قطري")
                            ? "قطريين"
                            : "جميع الجنسيات"}
                        </Badge>
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
              {universityScholarships.map((uni) => (
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
                      <Badge
                        variant="outline"
                        className="text-[10px] flex-shrink-0"
                      >
                        {uni.type}
                      </Badge>
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
