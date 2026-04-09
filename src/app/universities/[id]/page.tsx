import { Metadata } from "next";
import { notFound } from "next/navigation";
import universitiesData from "../../../../data/universities.json";
import type { UniversitiesData } from "@/types/university";
import UniversityDetailClient from "./university-detail-client";

const data = universitiesData as unknown as UniversitiesData;

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { id } = await params;
  const university = data.universities[id];
  if (!university) return { title: "غير موجود" };

  return {
    title: `${university.nameAr} | المستشار الجامعي القطري`,
    description: `معلومات شاملة عن ${university.nameAr} — شروط القبول، الكليات، المنح الدراسية`,
  };
}

export function generateStaticParams() {
  return Object.keys(data.universities).map((id) => ({ id }));
}

export default async function UniversityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const university = data.universities[id];

  if (!university) {
    notFound();
  }

  return <UniversityDetailClient id={id} university={university} />;
}
