"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  MessageCircle,
  Building2,
  Award,
  Calculator,
  Briefcase,
  GitCompareArrows,
} from "lucide-react";

const NAV_LINKS = [
  { label: "الرئيسية", href: "/", icon: null },
  { label: "الجامعات", href: "/universities", icon: Building2 },
  { label: "المنح", href: "/scholarships", icon: Award },
  { label: "حاسبة القبول", href: "/calculator", icon: Calculator },
  { label: "المسارات المهنية", href: "/careers", icon: Briefcase },
  { label: "المحادثة الذكية", href: "/chat", icon: MessageCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const themeIcon =
    theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : theme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-background/95 shadow-md backdrop-blur-md border-b border-border"
          : "bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Name */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-sm border border-border flex items-center justify-center overflow-hidden">
              <Image
                src="/logo-192.png"
                alt="المستشار الجامعي القطري"
                width={40}
                height={40}
                unoptimized
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <span className="font-bold text-[15px] text-maroon dark:text-primary hidden sm:inline-block">
              المستشار الجامعي القطري
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-maroon dark:text-primary bg-maroon-light dark:bg-primary/10 border-b-2 border-maroon dark:border-primary"
                    : "text-foreground/70 hover:text-maroon dark:hover:text-primary hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-9 w-9 rounded-xl inline-flex items-center justify-center hover:bg-muted cursor-pointer"
              >
                {themeIcon}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="ml-2 h-4 w-4" />
                  فاتح
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="ml-2 h-4 w-4" />
                  داكن
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="ml-2 h-4 w-4" />
                  تلقائي
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA */}
            <Link href="/chat">
              <Button className="bg-maroon hover:bg-maroon-dark text-white rounded-xl px-5 text-[13px] font-bold shadow-sm">
                ابدأ الآن
              </Button>
            </Link>
          </div>

          {/* Mobile: Theme + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-9 w-9 rounded-xl inline-flex items-center justify-center hover:bg-muted cursor-pointer"
              >
                {themeIcon}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="ml-2 h-4 w-4" />
                  فاتح
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="ml-2 h-4 w-4" />
                  داكن
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="ml-2 h-4 w-4" />
                  تلقائي
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => setMobileOpen(true)}
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[280px] p-0">
          <SheetHeader className="bg-gradient-to-l from-maroon to-maroon-dark text-white p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo-192.png"
                  alt="المستشار الجامعي القطري"
                  width={48}
                  height={48}
                  unoptimized
                  className="object-contain rounded-lg"
                />
              </div>
              <div>
                <SheetTitle className="text-white font-bold text-[15px]">
                  المستشار الجامعي القطري
                </SheetTitle>
                <p className="text-[11px] text-white/65">
                  مرشدك الذكي للجامعات
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="p-4 space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-maroon dark:text-primary bg-maroon-light dark:bg-primary/10"
                      : "text-foreground/80 hover:bg-muted"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`h-4.5 w-4.5 ${
                        isActive(link.href)
                          ? "text-maroon dark:text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="p-4 mt-4">
            <Link href="/chat" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-maroon hover:bg-maroon-dark text-white rounded-xl py-3 text-[14px] font-bold shadow-sm">
                ابدأ الآن
              </Button>
            </Link>
          </div>

          {/* Legal Links */}
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/privacy"
                onClick={() => setMobileOpen(false)}
                className="text-[11px] text-muted-foreground hover:text-maroon transition-colors"
              >
                الخصوصية
              </Link>
              <Link
                href="/terms"
                onClick={() => setMobileOpen(false)}
                className="text-[11px] text-muted-foreground hover:text-maroon transition-colors"
              >
                الشروط
              </Link>
              <Link
                href="/data-rights"
                onClick={() => setMobileOpen(false)}
                className="text-[11px] text-muted-foreground hover:text-maroon transition-colors"
              >
                حقوق البيانات
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
