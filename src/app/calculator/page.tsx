import { Metadata } from "next";
import universitiesData from "../../../data/universities.json";
import type { UniversitiesData } from "@/types/university";
import CalculatorClient from "./calculator-client";

export const metadata: Metadata = {
  title: "حاسبة القبول | المستشار الجامعي القطري",
  description:
    "أدخل معدلك واكتشف الجامعات التي تقبلك في قطر — مرتبة حسب نسبة التطابق",
};

export default function CalculatorPage() {
  const data = universitiesData as unknown as UniversitiesData;
  const universities = Object.entries(data.universities);

  return <CalculatorClient universities={universities} />;
}
