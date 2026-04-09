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
            <Badge className="bg-white/15 text-white border-white/20">
              <Calendar className="h-3 w-3 ml-1" />
              تأسست {university.founded}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Colleges */}
        {university.colleges && university.colleges.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-maroon dark:text-primary" />
                الكليات ({university.colleges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {university.colleges.map((college) => (
                  <Badge key={college} variant="outline" className="text-[12px]">
                    {college}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
              {university.admissionRequirements.qatari && (
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
              )}
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
              <div className="space-y-3">
                {Object.entries(
                  university.scholarships as Record<
                    string,
                    { name?: string; coverage?: string; conditions?: string }
                  >
                ).map(([key, scholarship]) => (
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
                ))}
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
