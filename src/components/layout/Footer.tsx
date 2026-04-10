import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 py-2 px-4 bg-card/95 backdrop-blur-sm border-t border-border flex-shrink-0">
      {/* App brand — Qatar University Advisor */}
      <div className="flex items-center gap-1.5">
        <Image
          src="/logo-mark.svg"
          alt="المستشار الجامعي القطري"
          width={18}
          height={18}
          className="h-[18px] w-[18px] opacity-90 dark:brightness-110 dark:opacity-95"
          unoptimized
        />
        <span className="text-[11px] font-semibold text-foreground/80">
          المستشار الجامعي القطري
        </span>
      </div>
      <span className="text-[11px] text-border">&middot;</span>
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
