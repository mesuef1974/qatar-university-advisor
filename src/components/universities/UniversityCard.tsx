"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import type { University } from "@/types/university";
import Link from "next/link";

interface UniversityCardProps {
  id: string;
  university: University;
}

export default function UniversityCard({ id, university }: UniversityCardProps) {
  const typeColor =
    university.type === "حكومية"
      ? "bg-maroon/10 text-maroon dark:bg-maroon/20 dark:text-primary border-maroon/20"
      : university.type === "خاصة"
        ? "bg-gold/10 text-gold-dark dark:text-gold border-gold/20"
        : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200";

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-maroon/20 dark:hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-bold leading-tight">
              {university.nameAr}
            </CardTitle>
            <p className="text-[12px] text-muted-foreground mt-1">
              {university.nameEn}
            </p>
          </div>
          <Badge variant="outline" className={`text-[10px] ${typeColor} flex-shrink-0`}>
            {university.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1.5 text-[13px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{university.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>تأسست {university.founded}</span>
          </div>
          {university.colleges && (
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{university.colleges.length} كلية</span>
            </div>
          )}
          {university.admissionRequirements?.qatari && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                الحد الادنى:{" "}
                {university.admissionRequirements.qatari.minGPA}%
              </span>
            </div>
          )}
        </div>

        {/* Colleges preview */}
        {university.colleges && university.colleges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {university.colleges.slice(0, 4).map((college) => (
              <Badge
                key={college}
                variant="secondary"
                className="text-[10px] font-normal"
              >
                {college}
              </Badge>
            ))}
            {university.colleges.length > 4 && (
              <Badge variant="secondary" className="text-[10px] font-normal">
                +{university.colleges.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Link href={`/universities/${id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[12px] h-8"
            >
              التفاصيل
            </Button>
          </Link>
          {university.website && (
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
