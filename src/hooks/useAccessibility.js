/**
 * useAccessibility — WCAG 2.2 AA Hook
 * T-Q7-T012: تحسين إمكانية الوصول
 */
import { useEffect, useRef } from 'react';

/**
 * إعلان للقارئات الصوتية (Screen Readers)
 */
export function useAnnounce() {
  const announcerRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('sr-announcer')) {
      const announcer = document.createElement('div');
      announcer.id            = 'sr-announcer';
      announcer.role          = 'status';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className     = 'sr-only';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    } else {
      announcerRef.current = document.getElementById('sr-announcer');
    }
  }, []);

  const announce = (message) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = '';
      setTimeout(() => {
        announcerRef.current.textContent = message;
      }, 100);
    }
  };

  return { announce };
}

/**
 * إدارة Focus للـ Modal والـ Dialog
 */
export function useFocusTrap(isActive) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusable = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length === 0) return;

    const firstEl = focusable[0];
    const lastEl  = focusable[focusable.length - 1];

    firstEl.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
