import { Metadata } from "next";
import universitiesData from "../../../data/universities.json";
import type { UniversitiesData } from "@/types/university";
import CompareClient from "./compare-client";

export const metadata: Metadata = {
  title: "مقارنة الجامعات | المستشار الجامعي القطري",
  description: "قارن بين الجامعات في قطر من حيث شروط القبول والمنح والتخصصات",
};

export default function ComparePage() {
  const data = universitiesData as unknown as UniversitiesData;
  const universities = Object.entries(data.universities);

  return <CompareClient universities={universities} />;
}
