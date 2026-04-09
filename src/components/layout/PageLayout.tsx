"use client";

import Footer from "./Footer";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Main content — scrollable */}
      <main className="flex-1">{children}</main>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 z-40">
        <Footer />
      </div>
    </div>
  );
}
