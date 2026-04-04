import { useEffect, useCallback, useRef } from 'react';

/**
 * UX-A4: Keyboard Navigation الشامل
 * هوك للتنقل بالكيبورد في التطبيق
 *
 * 1. Escape يغلق أي قائمة/نافذة مفتوحة
 * 2. أسهم الكيبورد تتنقل بين أزرار الاقتراحات
 * 3. Tab trap داخل منطقة المحادثة
 * 4. استعادة الفوكس عند إغلاق النوافذ
 */
export default function useKeyboardNav() {
  const previousFocusRef = useRef(null);

  // ── 1. Escape يغلق أي modal/dialog/menu مفتوح ──
  const handleEscape = useCallback((e) => {
    if (e.key !== 'Escape') return;

    // أغلق القائمة الجانبية إن كانت مفتوحة
    const sideMenu = document.querySelector('[data-side-menu]');
    if (sideMenu) {
      const closeBtn = sideMenu.querySelector('button');
      if (closeBtn) {
        closeBtn.click();
        // 4. استعادة الفوكس بعد إغلاق القائمة
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
          previousFocusRef.current = null;
        }
        return;
      }
    }

    // أغلق أي dialog مفتوح
    const openDialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    openDialogs.forEach((dialog) => {
      const closeBtn = dialog.querySelector('[aria-label*="غلق"], [aria-label*="close"], [aria-label*="إغلاق"]');
      if (closeBtn) closeBtn.click();
    });

    // أغلق أي expanded university card
    const expandedCards = document.querySelectorAll('[data-expanded="true"]');
    expandedCards.forEach((card) => card.click());

    // استعادة الفوكس
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  // ── 2. أسهم الكيبورد تتنقل بين أزرار الاقتراحات ──
  const handleArrowNavigation = useCallback((e) => {
    // فقط عند وجود أزرار اقتراحات مرئية
    const suggestionContainer = document.querySelector('[data-suggestions]');
    if (!suggestionContainer) return;

    const buttons = Array.from(suggestionContainer.querySelectorAll('button'));
    if (buttons.length === 0) return;

    const currentIndex = buttons.indexOf(document.activeElement);

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      // RTL: ArrowLeft يتحرك للأمام (العنصر التالي)
      const nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      buttons[nextIndex].focus();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      // RTL: ArrowRight يرجع للخلف (العنصر السابق)
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      buttons[prevIndex].focus();
    }
  }, []);

  // ── 3. Tab trap داخل منطقة المحادثة ──
  const handleTabTrap = useCallback((e) => {
    if (e.key !== 'Tab') return;

    const chatArea = document.querySelector('[data-chat-area]');
    if (!chatArea) return;

    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(chatArea.querySelectorAll(focusableSelectors))
      .filter(el => !el.disabled && el.offsetParent !== null);

    if (focusableElements.length === 0) return;

    // تفعيل Tab trap فقط إذا الفوكس الحالي داخل المحادثة
    if (!chatArea.contains(document.activeElement)) return;

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: إذا كنا على أول عنصر، اذهب لآخر عنصر
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      // Tab: إذا كنا على آخر عنصر، اذهب لأول عنصر
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }, []);

  // ── 4. حفظ الفوكس قبل فتح القائمة ──
  const handleFocusSave = useCallback(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    if (menuButton) {
      menuButton.addEventListener('click', () => {
        previousFocusRef.current = document.activeElement;
      });
    }
  }, []);

  // ── ربط جميع المعالجات ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      handleEscape(e);
      handleArrowNavigation(e);
      handleTabTrap(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    handleFocusSave();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEscape, handleArrowNavigation, handleTabTrap, handleFocusSave]);
}
