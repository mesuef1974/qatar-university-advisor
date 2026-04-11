/**
 * Type declarations for user-profiler.js
 * Manually maintained until user-profiler.js is migrated to TypeScript.
 */

/** User type constants */
export declare const USER_TYPES: {
  readonly STUDENT_HS: 'student_highschool';
  readonly STUDENT_PRIVATE: 'student_private_school';
  readonly STUDENT_UNI: 'student_university';
  readonly STUDENT_GRAD: 'student_graduate';
  readonly PARENT: 'parent';
  readonly GENERAL: 'general';
};

/** Union of all user type string values */
export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

/** A response with text and quick-reply suggestions */
export interface ProfilerResponse {
  text: string;
  suggestions: string[];
}

/** Partial user profile accumulated over the conversation */
export interface UserProfile {
  userType?: UserType | string;
  nationality?: 'qatari' | 'non_qatari' | null;
  track?: 'scientific' | 'literary' | 'commercial' | 'technical' | null;
  gpa?: number | null;
  preferredMajor?: string | null;
  messageCount?: number;
  conversationStage?: string;
  [key: string]: unknown;
}

/**
 * Detect user type from message text.
 * Returns `USER_TYPES.GENERAL` if no signals match.
 */
export declare function detectUserType(
  text: string,
  existingProfile?: Partial<UserProfile>,
): UserType | string;

/**
 * Detect user nationality from message text.
 * Returns `null` if no signals match.
 */
export declare function detectNationality(
  text: string,
  existingProfile?: Partial<UserProfile>,
): 'qatari' | 'non_qatari' | null;

/**
 * Detect academic track from message text.
 * Returns `null` if not detected.
 */
export declare function detectTrack(
  text: string,
  existingProfile?: Partial<UserProfile>,
): 'scientific' | 'literary' | 'commercial' | 'technical' | null;

/**
 * Extract GPA (0–100) from message text.
 * Returns `null` if no numeric grade is found.
 */
export declare function extractGPA(text: string): number | null;

/**
 * Update a user profile with signals found in the latest message.
 * Merges onto `existingProfile` and returns the updated profile.
 */
export declare function buildUserProfile(
  message: string,
  existingProfile?: Partial<UserProfile>,
): UserProfile;

/**
 * Build a one-line Arabic context string for the AI (e.g. "[معلومات المتحدث: ...]").
 * Returns an empty string if the profile is empty.
 */
export declare function buildProfileContext(profile: Partial<UserProfile>): string;

/**
 * Generate the opening welcome message shown to every new user.
 */
export declare function getWelcomeMessage(): ProfilerResponse;

/**
 * Return the next profiling question to ask the user, or `null` when the
 * profile is sufficiently complete.
 */
export declare function getNextProfilingQuestion(
  profile: Partial<UserProfile>,
): string | null;

/**
 * Generate contextual quick-reply suggestions based on the current profile
 * and the topic of the last bot message.
 */
export declare function generateSmartSuggestions(
  profile: Partial<UserProfile>,
  lastTopic?: string,
): string[];

/**
 * Read the in-memory profile for a given phone number.
 * Returns `null` when no profile has been saved yet.
 */
export declare function getInMemoryProfile(
  phone: string,
): UserProfile | null;

/**
 * Persist a profile to the in-memory store keyed by phone number.
 */
export declare function saveInMemoryProfile(
  phone: string,
  profile: Partial<UserProfile>,
): void;

/**
 * Remove the in-memory profile for a given phone number (e.g. on logout).
 */
export declare function invalidateInMemoryProfile(phone: string): void;
