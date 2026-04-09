import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "المستشار الجامعي القطري | Qatar University Advisor",
  description:
    "مستشارك الذكي لاختيار الجامعة والتخصص في قطر. معلومات شاملة عن 23 جامعة، شروط القبول، المنح الدراسية، والمسارات المهنية.",
  keywords: [
    "جامعات قطر",
    "القبول الجامعي",
    "منح دراسية",
    "جامعة قطر",
    "المدينة التعليمية",
    "Qatar University",
    "Education City",
  ],
  authors: [{ name: "شركة أذكياء للبرمجيات | Azkia" }],
  openGraph: {
    title: "المستشار الجامعي القطري",
    description: "مستشارك الذكي لاختيار الجامعة والتخصص في قطر",
    locale: "ar_QA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#8A1538",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
