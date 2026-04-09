"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Globe } from "lucide-react";

interface NationalityPickerProps {
  onSelect: (nationality: "qatari" | "non_qatari") => void;
}

export default function NationalityPicker({
  onSelect,
}: NationalityPickerProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-maroon/10 dark:bg-maroon/20 flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-maroon dark:text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">
            المستشار الجامعي القطري
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            اختر جنسيتك لتحصل على توصيات مخصصة
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <Button
            onClick={() => onSelect("qatari")}
            variant="outline"
            className="w-full h-14 text-base font-bold gap-3 rounded-xl border-2 hover:border-maroon hover:bg-maroon-light dark:hover:bg-maroon/10 transition-all"
          >
            <span className="text-lg">🇶🇦</span>
            قطري / قطرية
          </Button>
          <Button
            onClick={() => onSelect("non_qatari")}
            variant="outline"
            className="w-full h-14 text-base font-bold gap-3 rounded-xl border-2 hover:border-gold hover:bg-gold/5 transition-all"
          >
            <Globe className="h-5 w-5 text-muted-foreground" />
            مقيم في قطر
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
