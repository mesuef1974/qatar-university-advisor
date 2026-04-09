"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ChatView from "@/components/chat/ChatView";
import { useChatStore, useHydrateStore, createUserMessage, createBotMessage } from "@/store/chat-store";
import { useCallback } from "react";

export default function ChatPage() {
  const hydrated = useHydrateStore();
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
    <div className="flex flex-col h-dvh">
      {!hydrated ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">
            جاري التحميل...
          </div>
        </div>
      ) : (
        <>
          <Header />
          <Sidebar onSendMessage={handleSidebarMessage} />
          <ChatView />

          {/* Legal footer */}
          <footer className="flex items-center justify-center gap-4 py-1.5 px-4 bg-card border-t border-border flex-shrink-0">
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
            <p className="text-[10px] text-muted-foreground/60">
              © 2026 شركة أذكياء للبرمجيات | Azkia Software Co.
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
