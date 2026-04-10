import Link from "next/link";
import Image from "next/image";

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
        <Image
          src="/azkia-logo.svg"
          alt="شعار شركة أذكياء للبرمجيات"
          width={16}
          height={16}
          className="h-4 w-4 opacity-80 hover:opacity-100 transition-opacity dark:brightness-110"
          unoptimized
        />
        <span className="text-[10px] text-muted-foreground/60">
          &copy; 2026 شركة أذكياء للبرمجيات | Azkia Software Co.
        </span>
      </div>
    </footer>
  );
}
