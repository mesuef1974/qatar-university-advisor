/**
 * Type declarations for conversation-state.js
 * Manually maintained until conversation-state.js is migrated to TypeScript.
 */

/** The seven conversation stages */
export type ConversationStage =
  | 'STAGE_0'
  | 'STAGE_1'
  | 'STAGE_2'
  | 'STAGE_3'
  | 'STAGE_4'
  | 'STAGE_5'
  | 'STAGE_6';

/** Map of stage keys to their string values */
export declare const STAGES: Record<ConversationStage, ConversationStage>;

/** Loose user profile shape (mirrors ProcessingProfile in findResponse.ts) */
export interface ConversationProfile {
  nationality?: string | null;
  userType?: string;
  gpa?: number | null;
  track?: string | null;
  preferredMajor?: string | null;
  messageCount?: number;
  conversationStage?: string;
  [key: string]: unknown;
}

/** A response with text and suggestions */
export interface ConversationResponse {
  text: string;
  suggestions: string[];
}

/**
 * Non-linear stage transition — may jump stages based on message content.
 *
 * @param currentStage - Current stage key (e.g. `'STAGE_2'`)
 * @param profile      - Current user profile
 * @param userMessage  - Raw user message text
 * @returns The next stage key
 */
export declare function getNextStage(
  currentStage: string,
  profile: ConversationProfile,
  userMessage: string,
): ConversationStage;

/**
 * Get the guiding prompt text to display for a given stage.
 * Returns `null` if no prompt is needed for this stage.
 */
export declare function getStagePrompt(
  stage: string,
  profile: ConversationProfile,
): string | null;

/**
 * Generate a personalised final report (STAGE_6) from the completed profile.
 */
export declare function generateFinalReport(
  profile: ConversationProfile,
): ConversationResponse;

/**
 * Returns `true` when the conversation has reached STAGE_6 (complete).
 */
export declare function isConversationComplete(stage: string): boolean;

/**
 * Calculate profile completeness as a percentage (0–100).
 */
export declare function getProfileCompleteness(profile: ConversationProfile): number;
