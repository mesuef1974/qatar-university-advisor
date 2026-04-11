/**
 * Type declarations for knowledge-base.js
 * Manually maintained until knowledge-base.js is migrated to TypeScript.
 */

/** A cache hit result from the knowledge base */
export interface KnowledgeCacheHit {
  id: string | number;
  answer: string;
  suggestions: string[];
  similarity: number;
}

/** Result of a semantic search */
export interface SemanticSearchResult {
  answer: string;
  similarity: number;
  suggestions?: string[];
}

/** Options for seeding the knowledge cache */
export interface SeedKnowledgeCacheOptions {
  force?: boolean;
  withEmbeddings?: boolean;
}

/** Normalize Arabic text for comparison */
export declare function normalizeText(text: string): string;

/** Detect the category of an Arabic question */
export declare function detectCategory(text: string): string;

/**
 * Search the Supabase knowledge_cache for a matching answer.
 * Returns `null` if no match meets the similarity threshold.
 */
export declare function searchKnowledgeCache(
  question: string,
): Promise<KnowledgeCacheHit | null>;

/**
 * Save a question-answer pair to the knowledge_cache.
 * Returns `null` if Supabase is unavailable or the answer is too short/long.
 */
export declare function saveToKnowledgeCache(
  question: string,
  answer: string,
  suggestions?: string[],
  category?: string | null,
): Promise<unknown>;

/** Increment the `use_count` for a cached entry by id */
export declare function incrementCacheUse(id: string | number): Promise<void>;

/** Log a query analytics event */
export declare function logAnalytics(
  query: string,
  cacheHit: boolean,
  responseMs: number,
  matchedKey?: string | null,
): Promise<void>;

/**
 * High-level lookup: try cache first, then semantic search.
 * Returns `null` if no result is found.
 */
export declare function getFromKnowledgeBase(
  question: string,
): Promise<KnowledgeCacheHit | null>;

/** Generate an embedding vector for a text (via Gemini API) */
export declare function generateEmbedding(text: string): Promise<number[] | null>;

/**
 * Semantic vector search over the knowledge cache.
 * Returns `null` if embeddings are unavailable or no match found.
 */
export declare function semanticSearch(
  question: string,
): Promise<SemanticSearchResult | null>;

/** Save a question-answer pair with a pre-computed embedding */
export declare function saveToKnowledgeCacheWithEmbedding(
  question: string,
  answer: string,
  suggestions?: string[],
  category?: string | null,
): Promise<unknown>;

/** Seed the knowledge cache from static data files */
export declare function seedKnowledgeCache(
  options?: SeedKnowledgeCacheOptions,
): Promise<void>;
