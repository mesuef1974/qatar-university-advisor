/**
 * Types — Qatar University Advisor
 * T-Q7-T017: TypeScript Migration
 * الأنواع الأساسية للمشروع
 */

// ──────────────────────────────────────────────────────────
// User Profile Types
// ──────────────────────────────────────────────────────────

export type Nationality = 'qatari' | 'non_qatari' | null;

export type AcademicTrack = 'scientific' | 'literary' | 'commercial' | 'technical' | null;

export type UserType =
  | 'student_hs'
  | 'student_uni'
  | 'student_grad'
  | 'parent'
  | 'general';

export interface UserProfile {
  nationality:     Nationality;
  userType:        UserType;
  gpa:             number | null;
  track:           AcademicTrack;
  preferredMajor:  string | null;
  messageCount:    number;
  lastUpdated?:    string;
}

// ──────────────────────────────────────────────────────────
// University Types
// ──────────────────────────────────────────────────────────

export type UniversityType = 'حكومية' | 'خاصة' | 'أمريكية — فرع قطر' | 'فرنسية — فرع قطر';

export interface AdmissionRequirements {
  minGPA?:        number;
  sat?:           string;
  english?:       string;
  gmat?:          string;
  mcat?:          string;
  deadline?:      string;
  extras?:        string;
}

export interface University {
  nameAr:          string;
  nameEn:          string;
  website:         string;
  location:        string;
  type:            UniversityType;
  programs?:       string[];
  colleges?:       string[];
  admissionRequirements?: {
    qatari?:     AdmissionRequirements;
    nonQatari?:  AdmissionRequirements;
    [key: string]: AdmissionRequirements | undefined;
  };
  tuitionFees?: {
    qatari?:     number | string;
    nonQatari?:  { perCredit?: string; perYear?: string };
    note?:       string;
  };
  scholarships?: {
    [key: string]: {
      name?:       string;
      coverage?:   string | string[];
      conditions?: string;
    };
  };
}

// ──────────────────────────────────────────────────────────
// Conversation Types
// ──────────────────────────────────────────────────────────

export type ConversationStage =
  | 'STAGE_0'
  | 'STAGE_1'
  | 'STAGE_2'
  | 'STAGE_3'
  | 'STAGE_4'
  | 'STAGE_5'
  | 'STAGE_6';

export interface ConversationMessage {
  role:      'user' | 'assistant';
  content:   string;
  timestamp: string;
}

export interface ConversationContext {
  phone:    string;
  stage:    ConversationStage;
  profile:  UserProfile;
  history:  ConversationMessage[];
}

// ──────────────────────────────────────────────────────────
// API Response Types
// ──────────────────────────────────────────────────────────

export interface BotResponse {
  text:          string;
  suggestions?:  string[];
  profile?:      Partial<UserProfile>;
  error?:        string;
}

export interface SanitizeResult {
  safe:       boolean;
  sanitized:  string;
  reason?:    'invalid_input' | 'flooding_detected' | 'prompt_injection' | 'sensitive_extraction';
}

export interface RateLimitResult {
  success:    boolean;
  limit:      number;
  remaining:  number;
  resetAt:    number;
  source:     'redis' | 'memory';
}

// ──────────────────────────────────────────────────────────
// Circuit Breaker Types
// ──────────────────────────────────────────────────────────

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStatus {
  state:           CircuitState;
  failures:        number;
  lastFailureTime: number | null;
  isHealthy:       boolean;
}

// ──────────────────────────────────────────────────────────
// Admin Types
// ──────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers:    number;
  totalMessages: number;
  totalQueries:  number;
}

export interface AdminDashboard {
  timestamp:     string;
  stats:         AdminStats;
  topQueries:    Array<{ query: string; count: number }>;
  circuitStatus: CircuitBreakerStatus;
  botStatus: {
    vercel:    'operational' | 'degraded' | 'down';
    whatsapp:  'operational' | 'degraded' | 'down';
    gemini:    'operational' | 'degraded' | 'down';
    supabase:  'operational' | 'degraded' | 'down';
  };
}
