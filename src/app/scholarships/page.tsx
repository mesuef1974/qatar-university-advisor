import { Metadata } from "next";
import universitiesData from "../../../data/universities.json";
import type { UniversitiesData } from "@/types/university";
import ScholarshipsClient from "./scholarships-client";

export const metadata: Metadata = {
  title: "المنح الدراسية | المستشار الجامعي القطري",
  description: "المنح الدراسية المتاحة في قطر للطلاب القطريين والمقيمين",
};

export default function ScholarshipsPage() {
  const data = universitiesData as unknown as UniversitiesData;
  const universities = Object.entries(data.universities);
  const governmentScholarships = (data as unknown as Record<string, unknown>).governmentScholarships as Record<string, GovernmentScholarship> | undefined;

  return (
    <ScholarshipsClient
      universities={universities}
      governmentScholarships={governmentScholarships ?? {}}
    />
  );
}

export interface GovernmentScholarship {
  nameAr: string;
  provider: string;
  eligibility: string;
  coverage: string | string[];
  universities?: string[];
  gpaRequired?: number;
  deadline?: string;
  applicationUrl?: string;
  website?: string;
  tracks?: string[];
  [key: string]: unknown;
}
