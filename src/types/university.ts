export interface University {
  nameAr: string;
  nameEn: string;
  logoUrl?: string;
  website: string;
  admissionsUrl?: string;
  location: string;
  type: string;
  founded?: number;
  admissionRequirements?: {
    qatari?: {
      minGPA: number;
      notes?: string;
      [key: string]: unknown;
    };
    nonQatari?: {
      minGPA: number;
      [key: string]: unknown;
    };
  };
  applicationDeadlines?: Record<string, unknown>;
  colleges?: (string | { name: string; nameEn?: string; [key: string]: unknown })[];
  scholarships?: Record<string, unknown>;
  tuitionFees?: Record<string, unknown>;
  searchIndex?: {
    aliases: string[];
    majorKeywords: string[];
    features: string[];
    costCategory: string;
  };
  [key: string]: unknown;
}

export interface UniversitiesData {
  _meta: {
    description: string;
    source: string;
    lastGlobalUpdate: string;
    academicYear: string;
    maintainer: string;
    notes: string;
  };
  universities: Record<string, University>;
}
