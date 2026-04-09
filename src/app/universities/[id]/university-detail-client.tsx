"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  Building2,
  GraduationCap,
  Award,
  Banknote,
} from "lucide-react";
import type { University } from "@/types/university";

interface Props {
  id: string;
  university: University;
}

export default function UniversityDetailClient({ id, university }: Props) {
  void id; // available for future use

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/universities">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{university.nameAr}</h1>
              <p className="text-[13px] text-white/65">
                {university.nameEn}
              </p>
            </div>
            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/15 text-white border-white/20">
              {university.type}
            </Badge>
            <Badge className="bg-white/15 text-white border-white/20">
              <MapPin className="h-3 w-3 ml-1" />
              {university.location}
            </Badge>
            {university.founded && (
              <Badge className="bg-white/15 text-white border-white/20">
                <Calendar className="h-3 w-3 ml-1" />
                تأسست {university.founded}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Colleges / Programs */}
        {(() => {
          const programs = university.colleges && university.colleges.length > 0
            ? university.colleges
            : Array.isArray((university as Record<string, unknown>).programs)
              ? ((university as Record<string, unknown>).programs as string[])
              : [];
          const label = university.colleges && university.colleges.length > 0
            ? "الكليات"
            : "التخصصات";
          return programs.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-maroon dark:text-primary" />
                  {label} ({programs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {programs.map((item) => (
                    <Badge key={item} variant="outline" className="text-[12px]">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null;
        })()}

        {/* Admission Requirements */}
        {university.admissionRequirements && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-maroon dark:text-primary" />
                شروط القبول
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {university.admissionRequirements.qatari ? (
                <>
                  <div>
                    <h4 className="font-bold text-[13px] text-maroon dark:text-primary mb-2">
                      للطلاب القطريين
                    </h4>
                    <p className="text-[13px] text-muted-foreground">
                      الحد الادنى للمعدل:{" "}
                      {university.admissionRequirements.qatari.minGPA}%
                    </p>
                    {university.admissionRequirements.qatari.notes && (
                      <p className="text-[12px] text-muted-foreground mt-1">
                        {university.admissionRequirements.qatari.notes}
                      </p>
                    )}
                  </div>
                  {university.admissionRequirements.nonQatari && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-bold text-[13px] text-gold-dark dark:text-gold mb-2">
                          لغير القطريين
                        </h4>
                        <p className="text-[13px] text-muted-foreground">
                          الحد الادنى للمعدل:{" "}
                          {university.admissionRequirements.nonQatari.minGPA}%
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  {Object.entries(
                    university.admissionRequirements as Record<string, unknown>
                  ).map(([key, value]) => {
                    if (typeof value !== "string") return null;
                    const labels: Record<string, string> = {
                      gpa: "المعدل",
                      sat: "SAT",
                      english: "اللغة الانجليزية",
                      ielts: "IELTS",
                      gmat: "GMAT",
                      mcat: "MCAT",
                      experience: "الخبرة",
                      portfolio: "البورتفوليو",
                      essays: "المقالات",
                      extras: "متطلبات اضافية",
                      math: "الرياضيات",
                      deadline: "الموعد النهائي",
                    };
                    return (
                      <div key={key} className="flex gap-2 text-[13px]">
                        <span className="font-bold text-muted-foreground min-w-[100px]">
                          {labels[key] || key}:
                        </span>
                        <span className="text-foreground">{value}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scholarships */}
        {university.scholarships && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-gold" />
                المنح الدراسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeof university.scholarships === "string" ? (
                <p className="text-[13px] text-foreground">
                  {university.scholarships}
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(
                    university.scholarships as Record<string, unknown>
                  ).map(([key, value]) => {
                    if (typeof value === "string") {
                      return (
                        <div key={key}>
                          <h4 className="font-bold text-[13px]">
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
                          <p className="text-[12px] text-muted-foreground">
                            {value}
                          </p>
                        </div>
                      );
                    }
                    const scholarship = value as {
                      name?: string;
                      coverage?: string;
                      conditions?: string;
                    };
                    return (
                      <div key={key}>
                        {scholarship.name && (
                          <h4 className="font-bold text-[13px]">
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
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tuition Fees */}
        {university.tuitionFees && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Banknote className="h-4 w-4 text-maroon dark:text-primary" />
                الرسوم الدراسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  university.tuitionFees as Record<string, unknown>
                ).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    qatari: "للقطريين",
                    nonQatari: "لغير القطريين",
                    perYear: "سنوياً",
                    perCredit: "لكل ساعة",
                    international: "للطلاب الدوليين",
                    note: "ملاحظة",
                    qatariScholarship: "منح القطريين",
                  };
                  if (typeof value === "object" && value !== null) {
                    return (
                      <div key={key}>
                        <h4 className="font-bold text-[13px] text-muted-foreground mb-1">
                          {labels[key] || key}
                        </h4>
                        {Object.entries(value as Record<string, unknown>).map(
                          ([subKey, subVal]) => (
                            <p
                              key={subKey}
                              className="text-[12px] text-foreground mr-3"
                            >
                              {labels[subKey] || subKey}: {String(subVal)}
                            </p>
                          )
                        )}
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="flex gap-2 text-[13px]">
                      <span className="font-bold text-muted-foreground">
                        {labels[key] || key}:
                      </span>
                      <span className="text-foreground">
                        {value === 0 ? "مجاني" : String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back to chat CTA */}
        <div className="text-center py-4">
          <Link href="/chat">
            <Button className="bg-maroon hover:bg-maroon-dark text-white">
              اسأل عن هذه الجامعة في المحادثة
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
