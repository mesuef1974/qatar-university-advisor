import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 py-2 px-4 bg-card/95 backdrop-blur-sm border-t border-border flex-shrink-0">
      <Link
        href="/privacy"
        className="text-[11px] text-muted-foreground hover:text-maroon dark:hover:text-primary transition-colors"
      >
        سياسة الخصوصية
      </Link>
      <span className="text-[11px] text-border">&middot;</span>
      <Link
        href="/terms"
        className="text-[11px] text-muted-foreground hover:text-maroon dark:hover:text-primary transition-colors"
      >
        شروط الاستخدام
      </Link>
      <span className="text-[11px] text-border">&middot;</span>
      <Link
        href="/data-rights"
        className="text-[11px] text-muted-foreground hover:text-maroon dark:hover:text-primary transition-colors"
      >
        حقوق البيانات
      </Link>
      <div className="flex items-center gap-1.5 mr-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-label="Azkia Logo"
        >
          <path d="M12 2L2 20h6l1.5-3h5l1.5 3h6L12 2z" fill="#8A1538" />
          <path d="M12 8l-2.5 5h5L12 8z" fill="#C5A55A" />
        </svg>
        <span className="text-[10px] text-muted-foreground/60">
          &copy; 2026 شركة أذكياء للبرمجيات | Azkia Software Co.
        </span>
      </div>
    </footer>
  );
}
