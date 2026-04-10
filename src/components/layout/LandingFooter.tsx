import Link from "next/link";
import Image from "next/image";

const QUICK_LINKS = [
  { label: "الجامعات", href: "/universities" },
  { label: "المنح", href: "/scholarships" },
  { label: "حاسبة القبول", href: "/calculator" },
  { label: "المسارات المهنية", href: "/careers" },
  { label: "المقارنة", href: "/compare" },
  { label: "المحادثة الذكية", href: "/chat" },
];

const LEGAL_LINKS = [
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "شروط الاستخدام", href: "/terms" },
  { label: "حقوق البيانات", href: "/data-rights" },
];

export default function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-sm border border-border flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo-192.png"
                  alt="المستشار الجامعي القطري"
                  width={40}
                  height={40}
                  unoptimized
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="font-bold text-[14px] text-foreground">
                المستشار الجامعي القطري
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
              مرشدك الذكي لاختيار الجامعة والتخصص في دولة قطر. معلومات شاملة ومحدثة
              من مصادر رسمية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-[14px] text-foreground mb-4">
              روابط سريعة
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted-foreground hover:text-maroon dark:hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-[14px] text-foreground mb-4">
              قانوني
            </h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted-foreground hover:text-maroon dark:hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + Copyright + Azkia Credit */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground/70">
            &copy; 2026 المستشار الجامعي القطري — جميع الحقوق محفوظة
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">
              تطوير وتقديم
            </span>
            <Image
              src="/azkia-logo.svg"
              alt="شعار شركة أذكياء للبرمجيات"
              width={22}
              height={22}
              className="h-[22px] w-[22px] opacity-90 hover:opacity-100 transition-opacity dark:brightness-110"
              unoptimized
            />
            <span className="text-[12px] font-medium text-foreground/80">
              شركة أذكياء للبرمجيات
              <span className="text-muted-foreground/70"> | Azkia Software Co.</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
