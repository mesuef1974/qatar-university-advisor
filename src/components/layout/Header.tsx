"use client";

import { useTheme } from "next-themes";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Sun,
  Moon,
  Monitor,
  Star,
  Globe,
} from "lucide-react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const {
    userProfile,
    sidebarOpen,
    setSidebarOpen,
    setNationality,
  } = useChatStore();

  const isQatari = userProfile.nationality === "qatari";

  const themeIcon =
    theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : theme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  return (
    <header className="bg-gradient-to-l from-maroon via-maroon-dark to-maroon-dark shadow-lg relative flex-shrink-0">
      <div className="flex items-center gap-3 h-[60px] px-4">
        {/* Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl bg-white/8 border border-white/12 text-white hover:bg-white/15 hover:text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="القائمة الجانبية"
        >
          <Menu className="h-[18px] w-[18px]" />
        </Button>

        {/* Logo + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-white p-1 shadow-sm flex items-center justify-center overflow-hidden">
            <Image
              src="/logo-192.png"
              alt="المستشار الجامعي القطري"
              width={40}
              height={40}
              className="object-contain rounded-lg"
              priority
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[15px] text-white leading-tight">
                المستشار الجامعي القطري
              </span>

              {/* Nationality badge */}
              {userProfile.nationality && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                      isQatari
                        ? "border border-gold/50 bg-gold/20 text-gold-light"
                        : "border border-white/22 bg-white/12 text-white/90"
                    }`}
                  >
                    <Globe className="h-3 w-3" />
                    {isQatari ? "قطري" : "مقيم"}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setNationality("qatari")}>
                      قطري / قطرية
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setNationality("non_qatari")}
                    >
                      مقيم في قطر
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-[11px] text-white/55 mt-0.5">
              {userProfile.grade
                ? `معدل ${userProfile.grade}% · ${userProfile.track || ""}`
                : "23 جامعة · قاعدة معرفة شاملة"}
            </p>
          </div>
        </div>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-9 w-9 rounded-xl bg-white/8 border border-white/12 text-white hover:bg-white/15 inline-flex items-center justify-center cursor-pointer"
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

        {/* Universities button */}
        <Link href="/universities">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border transition-colors bg-white/8 border-white/12 text-white hover:bg-gold/20 hover:text-white"
            aria-label="الجامعات"
          >
            <Star className="h-[17px] w-[17px]" />
          </Button>
        </Link>
      </div>

      {/* Gold accent underline */}
      <div className="h-0.5 bg-gradient-to-l from-transparent via-gold/60 to-transparent" />
    </header>
  );
}
