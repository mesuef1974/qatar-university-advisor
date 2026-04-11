"use client";

import React from "react";
import type { ChatMessage } from "@/store/chat-store";

/**
 * Renders inline markdown: **bold** and [link](url)
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let lastIndex = 0;
  let idx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={idx++}>{text.slice(lastIndex, match.index)}</span>
      );
    }
    if (match[1] !== undefined) {
      parts.push(
        <strong key={idx++} className="font-bold">
          {match[1]}
        </strong>
      );
    } else if (match[2] && match[3]) {
      parts.push(
        <a
          key={idx++}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold underline hover:text-gold-dark transition-colors"
        >
          {match[2]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={idx++}>{text.slice(lastIndex)}</span>);
  }

  return parts;
}

/**
 * Renders text content from bot with markdown support
 */
function renderBotContent(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line = break
    if (line.trim() === "") {
      elements.push(<br key={`br-${i}`} />);
      continue;
    }

    // Bullet point
    if (/^[•\-\*]\s/.test(line.trim())) {
      elements.push(
        <div key={`li-${i}`} className="flex gap-2 my-0.5 pr-1">
          <span className="text-gold flex-shrink-0 mt-0.5">&#8226;</span>
          <span>{renderInlineMarkdown(line.trim().replace(/^[•\-\*]\s/, ""))}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    if (/^\d+[\.\)]\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+[\.\)])\s(.*)/);
      if (match) {
        elements.push(
          <div key={`ol-${i}`} className="flex gap-2 my-0.5 pr-1">
            <span className="text-maroon dark:text-primary font-bold flex-shrink-0 min-w-[20px]">
              {match[1]}
            </span>
            <span>{renderInlineMarkdown(match[2])}</span>
          </div>
        );
        continue;
      }
    }

    // Regular line
    elements.push(
      <p key={`p-${i}`} className="my-0.5">
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  return <>{elements}</>;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.type === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-start" : "justify-end"} mb-3 px-4`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
          isUser
            ? "bg-maroon dark:bg-maroon/80 text-white rounded-br-sm"
            : "bg-card border border-border text-card-foreground rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="space-y-0.5">{renderBotContent(message.content)}</div>
        )}

        <div
          className={`text-[10px] mt-2 ${
            isUser ? "text-white/50" : "text-muted-foreground"
          }`}
        >
          {message.time}
          {message.source && !isUser && (
            <span className="mr-2 opacity-50">
              {message.source === "ai" && "AI"}
              {message.source === "knowledge_base" && "قاعدة المعرفة"}
              {message.source === "keyword" && "محلي"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
