"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import UniversityCard from "@/components/universities/UniversityCard";
import type { University } from "@/types/university";
import Link from "next/link";

interface UniversitiesClientProps {
  universities: [string, University][];
}

export default function UniversitiesClient({
  universities,
}: UniversitiesClientProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = universities.filter(([, uni]) => {
    const matchesSearch =
      !search ||
      uni.nameAr.includes(search) ||
      uni.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      uni.location.includes(search);

    const matchesType = typeFilter === "all" || uni.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Get unique types
  const types = [...new Set(universities.map(([, u]) => u.type))];

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="bg-gradient-to-l from-maroon to-maroon-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
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
            <div>
              <h1 className="text-xl font-bold">الجامعات في قطر</h1>
              <p className="text-[13px] text-white/65">
                {universities.length} جامعة ومؤسسة تعليمية
              </p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن جامعة..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10 h-10 rounded-xl"
              />
            </div>
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val ?? "all")}>
              <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white h-10 rounded-xl">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">لا توجد نتائج</p>
            <p className="text-muted-foreground text-sm mt-1">
              جرّب كلمات بحث مختلفة
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(([id, uni]) => (
              <UniversityCard key={id} id={id} university={uni} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
