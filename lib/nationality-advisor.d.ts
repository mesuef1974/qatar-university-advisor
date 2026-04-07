/**
 * Type declarations for nationality-advisor.js
 * Manually maintained until nationality-advisor.js is migrated to TypeScript.
 */

/** A response entry with text and optional quick-reply suggestions */
export interface NationalityResponse {
  text: string;
  suggestions?: string[];
}

/**
 * Enhance a response object with nationality-specific advice and caveats.
 *
 * @param response  - The base response `{ text, suggestions }`
 * @param nationality - `'qatari'` | `'non_qatari'` | `null`
 * @param context   - The response key (e.g. `'qu'`, `'scholarship_amiri'`)
 * @returns An enhanced `{ text, suggestions }` object
 */
export declare function addNationalityContext(
  response: NationalityResponse,
  nationality: string | null | undefined,
  context: string,
): NationalityResponse;
