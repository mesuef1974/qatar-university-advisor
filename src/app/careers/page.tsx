import { Metadata } from "next";
import careersData from "../../../data/careers.json";
import CareersClient from "./careers-client";

export const metadata: Metadata = {
  title: "المسارات المهنية | المستشار الجامعي القطري",
  description: "استكشف المسارات المهنية والرواتب وفرص العمل في سوق قطر",
};

export interface CareerPath {
  title: string;
  titleEn: string;
  description: string;
  salaryRange: { entry: string; mid: string; senior: string };
  currency: string;
  demand: string;
  topEmployers: string[];
  relatedMajors: string[];
  universities: string[];
}

export interface CareerCategory {
  nameAr: string;
  nameEn: string;
  paths: CareerPath[];
}

export type CareersMap = Record<string, CareerCategory>;

export default function CareersPage() {
  const careers = careersData.careers as CareersMap;

  return <CareersClient careers={careers} />;
}
