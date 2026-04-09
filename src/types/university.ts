export interface University {
  nameAr: string;
  nameEn: string;
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
  colleges?: string[];
  scholarships?: Record<string, unknown>;
  tuitionFees?: Record<string, unknown>;
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
