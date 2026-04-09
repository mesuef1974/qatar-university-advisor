"use client";

import { useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useChatStore,
  createBotMessage,
  createUserMessage,
} from "@/store/chat-store";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import SuggestionChips from "./SuggestionChips";
import TypingIndicator from "./TypingIndicator";
import NationalityPicker from "./NationalityPicker";
import Image from "next/image";

function getWelcomeMessage(nationality: "qatari" | "non_qatari") {
  if (nationality === "qatari") {
    return {
      text: `**اهلا بك في المستشار الجامعي القطري!**\nمرحبا بالطالب/ة القطري/ة\n\nانا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n• كل الجامعات الحكومية مجانية لك\n• الكليات العسكرية متاحة لك\n• الابتعاث الاميري والخارجي متاح\n• منح قطر للطاقة والخطوط القطرية وQNB\n\nيمكنك سؤالي عن اي شيء!`,
      suggestions: [
        "جميع الجامعات",
        "الابتعاث الاميري",
        "الكليات العسكرية",
        "ارسل معدلك",
      ],
    };
  }
  return {
    text: `**اهلا بك في المستشار الجامعي القطري!**\nمرحبا بالطالب/ة المقيم/ة في قطر\n\nانا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n• جامعة قطر (رسوم 800-1,400 ريال/ساعة)\n• جامعات المدينة التعليمية (منح كاملة متاحة من مؤسسة قطر)\n• جامعة حمد بن خليفة HBKU (منح ممولة بالكامل لجميع الجنسيات)\n• جامعة لوسيل وUDST والكليات الخاصة\n• منحة الفاخورة للمقيمين\n\nيمكنك سؤالي عن اي شيء!`,
    suggestions: [
      "منح لغير القطريين",
      "جامعات المدينة التعليمية",
      "HBKU منح كاملة",
      "ارسل معدلك",
    ],
  };
}

export default function ChatView() {
  const {
    messages,
    input,
    isTyping,
    userProfile,
    setInput,
    setIsTyping,
    addMessage,
    setNationality,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle nationality selection
  const handleNationalitySelect = useCallback(
    (nat: "qatari" | "non_qatari") => {
      setNationality(nat);
      const welcome = getWelcomeMessage(nat);
      addMessage(createBotMessage(welcome.text, welcome.suggestions));
    },
    [setNationality, addMessage]
  );

  // Send message
  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = (text || input).trim();
      if (!messageText) return;

      // Add user message
      addMessage(createUserMessage(messageText));
      setInput("");
      setIsTyping(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: messageText,
            nationality: userProfile.nationality,
          }),
        });

        const data = await res.json();
        addMessage(
          createBotMessage(
            data.answer || "عذرا، حدث خطا. يرجى المحاولة مرة اخرى.",
            data.suggestions || [],
            data.source
          )
        );
      } catch {
        addMessage(
          createBotMessage(
            "عذرا، حدث خطا في الاتصال. يرجى المحاولة مرة اخرى.",
            ["جميع الجامعات", "المنح والابتعاث", "الرواتب والوظائف"]
          )
        );
      } finally {
        setIsTyping(false);
      }
    },
    [input, userProfile.nationality, addMessage, setInput, setIsTyping]
  );

  // If no nationality selected, show picker
  if (!userProfile.nationality) {
    return <NationalityPicker onSelect={handleNationalitySelect} />;
  }

  // Get last message suggestions
  const lastBotMessage = [...messages]
    .reverse()
    .find((m) => m.type === "bot");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages area */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-32 h-32 rounded-2xl bg-white p-4 shadow-md flex items-center justify-center mb-4">
                <Image
                  src="/logo-192.png"
                  alt="المستشار الجامعي القطري"
                  width={120}
                  height={120}
                  className="object-contain rounded-xl"
                />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                مرحبا بك!
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                اسأل عن اي جامعة، تخصص، منحة دراسية، او شروط قبول في قطر
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggestion chips */}
      {lastBotMessage?.suggestions && lastBotMessage.suggestions.length > 0 && (
        <SuggestionChips
          suggestions={lastBotMessage.suggestions}
          onSelect={(text) => sendMessage(text)}
        />
      )}

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => sendMessage()}
        disabled={isTyping}
      />
    </div>
  );
}
