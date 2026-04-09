import { Metadata } from "next";
import universitiesData from "../../../data/universities.json";
import type { UniversitiesData } from "@/types/university";
import UniversitiesClient from "./universities-client";

export const metadata: Metadata = {
  title: "الجامعات في قطر | المستشار الجامعي القطري",
  description:
    "قائمة شاملة بجميع الجامعات في قطر مع تفاصيل القبول والمنح والتخصصات",
};

export default function UniversitiesPage() {
  const data = universitiesData as unknown as UniversitiesData;
  const universities = Object.entries(data.universities);

  return <UniversitiesClient universities={universities} />;
}
