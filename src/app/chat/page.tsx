"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ChatView from "@/components/chat/ChatView";
import { useChatStore, useHydrateStore, createUserMessage, createBotMessage } from "@/store/chat-store";
import { useCallback } from "react";

function ChatPageInner() {
  const hydrated = useHydrateStore();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const { addMessage, setIsTyping, userProfile } = useChatStore();

  const handleSidebarMessage = useCallback(
    async (text: string) => {
      addMessage(createUserMessage(text));
      setIsTyping(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: text,
            nationality: userProfile.nationality,
          }),
        });
        const data = await res.json();
        addMessage(
          createBotMessage(
            data.answer || "عذرا، حدث خطا.",
            data.suggestions || [],
            data.source
          )
        );
      } catch {
        addMessage(
          createBotMessage("عذرا، حدث خطا في الاتصال.", [
            "جميع الجامعات",
            "المنح والابتعاث",
          ])
        );
      } finally {
        setIsTyping(false);
      }
    },
    [addMessage, setIsTyping, userProfile.nationality]
  );

  return (
    <div className="h-dvh flex flex-col">
      {!hydrated ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">
            جاري التحميل...
          </div>
        </div>
      ) : (
        <>
          {/* Header — sticky at top */}
          <div className="flex-shrink-0">
            <Header />
          </div>
          <Sidebar onSendMessage={handleSidebarMessage} />
          {/* Main content — takes remaining space */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ChatView initialQuery={initialQuery || undefined} />
          </div>

          {/* Legal footer — always at bottom */}
          <footer className="flex-shrink-0 flex items-center justify-center gap-4 py-1.5 px-4 bg-card border-t border-border">
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
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Azkia Logo">
                {/* Geometric A shape - triangle */}
                <path d="M12 2L2 20h6l1.5-3h5l1.5 3h6L12 2z" fill="#8A1538" />
                {/* Inner gold accent - small diamond */}
                <path d="M12 8l-2.5 5h5L12 8z" fill="#C5A55A" />
              </svg>
              <span className="text-[10px] text-muted-foreground/60">
                © 2026 شركة أذكياء للبرمجيات | Azkia Software Co.
              </span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-dvh items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">
            جاري التحميل...
          </div>
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}
