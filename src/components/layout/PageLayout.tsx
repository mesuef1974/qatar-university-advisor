"use client";

import Footer from "./Footer";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex flex-col">
      {/* Main content — scrollable area between fixed header and footer */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Footer — always at bottom */}
      <Footer />
    </div>
  );
}
