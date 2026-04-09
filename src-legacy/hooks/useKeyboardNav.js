import { useEffect, useCallback, useRef } from 'react';

/**
 * UX-A4: Keyboard Navigation الشامل
 * هوك للتنقل بالكيبورد في التطبيق
 *
 * Safe for React 19 + Vite 8 dev mode (dual React instance).
 * If useRef returns null the hook degrades gracefully — no crash.
 */
export default function useKeyboardNav() {
  const previousFocusRef = useRef(null);

  const handleEscape = useCallback((e) => {
    if (e.key !== 'Escape') return;
    try {
      const sideMenu = document.querySelector('[data-side-menu]');
      if (sideMenu) {
        const closeBtn = sideMenu.querySelector('button');
        if (closeBtn) {
          closeBtn.click();
          if (previousFocusRef?.current) {
            previousFocusRef.current.focus();
            previousFocusRef.current = null;
          }
          return;
        }
      }
      const openDialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
      openDialogs.forEach((dialog) => {
        const closeBtn = dialog.querySelector('[aria-label*="غلق"], [aria-label*="close"], [aria-label*="إغلاق"]');
        if (closeBtn) closeBtn.click();
      });
      const expandedCards = document.querySelectorAll('[data-expanded="true"]');
      expandedCards.forEach((card) => card.click());
      if (previousFocusRef?.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    } catch { /* graceful degradation */ }
  }, []);

  const handleArrowNavigation = useCallback((e) => {
    try {
      const suggestionContainer = document.querySelector('[data-suggestions]');
      if (!suggestionContainer) return;
      const buttons = Array.from(suggestionContainer.querySelectorAll('button'));
      if (buttons.length === 0) return;
      const currentIndex = buttons.indexOf(document.activeElement);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        buttons[nextIndex].focus();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        buttons[prevIndex].focus();
      }
    } catch { /* graceful degradation */ }
  }, []);

  const handleTabTrap = useCallback((e) => {
    if (e.key !== 'Tab') return;
    try {
      const chatArea = document.querySelector('[data-chat-area]');
      if (!chatArea) return;
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(chatArea.querySelectorAll(focusableSelectors))
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (focusableElements.length === 0) return;
      if (!chatArea.contains(document.activeElement)) return;
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      } else {
        if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    } catch { /* graceful degradation */ }
  }, []);

  useEffect(() => {
    try {
      const handleKeyDown = (e) => {
        handleEscape(e);
        handleArrowNavigation(e);
        handleTabTrap(e);
      };
      document.addEventListener('keydown', handleKeyDown);
      // حفظ الفوكس قبل فتح القائمة
      const menuButton = document.querySelector('[data-menu-toggle]');
      if (menuButton) {
        menuButton.addEventListener('click', () => {
          if (previousFocusRef) previousFocusRef.current = document.activeElement;
        });
      }
      return () => { document.removeEventListener('keydown', handleKeyDown); };
    } catch {
      // Hook failed to initialize — keyboard nav disabled, app still works
      return undefined;
    }
  }, [handleEscape, handleArrowNavigation, handleTabTrap]);
}
