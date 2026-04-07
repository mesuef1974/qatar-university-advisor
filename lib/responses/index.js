/**
 * Responses Module — Barrel Export
 * يُجمع جميع وحدات الردود في مكان واحد
 *
 * T-Q7-T010: تقسيم findResponse.js (God File)
 * المرحلة 1: إنشاء الهيكل — مكتملة ✅
 * المرحلة 2: النقل التدريجي — مكتملة ✅
 * المرحلة 3: Facade Pattern — مكتملة ✅
 */

export * from './universities.js';
export * from './admissions.js';
export * from './scholarships.js';
export * from './majors.js';
export * from './response-formatter.js';
export * from './message-router.js';
export * from './profile-handler.js';
export { mergeSuggestions } from './suggestion-engine.js';
// generateSmartSuggestions re-exported via profile-handler to avoid conflict
