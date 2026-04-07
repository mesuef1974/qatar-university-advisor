/**
 * Type declarations for responses.js
 * Manually maintained until responses.js is migrated to TypeScript.
 */

/** A single response entry with display text and quick-reply suggestions */
export interface ResponseEntry {
  text: string;
  suggestions: string[];
}

/** Map of response key → ResponseEntry */
export type ResponsesMap = Record<string, ResponseEntry>;

/** A career category in the personality test */
export interface CareerCategory {
  title: string;
  icon: string;
  description: string;
  universities: string[];
  careers: string[];
}

/** The career personality test object */
export interface CareerTest {
  questions: Array<{
    id: string;
    text: string;
    options: Array<{ value: string; label: string }>;
  }>;
  categories: Record<string, CareerCategory>;
}

/** University database entry */
export interface UniversityEntry {
  name: string;
  arabicName?: string;
  minGPA?: number;
  tracks?: string[];
  [key: string]: unknown;
}

export declare const RESPONSES: ResponsesMap;
export declare const ALL_RESPONSES: ResponsesMap;
export declare const UNIVERSITIES_DB: Record<string, UniversityEntry>;
export declare const CAREER_TEST: CareerTest;
