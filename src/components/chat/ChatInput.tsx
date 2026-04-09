"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t border-border bg-card/80 backdrop-blur-sm">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="اكتب سؤالك هنا..."
        disabled={disabled}
        className="flex-1 rounded-xl border-border bg-background text-[14px] h-11 px-4"
        dir="rtl"
      />
      <Button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        size="icon"
        className="h-11 w-11 rounded-xl bg-maroon hover:bg-maroon-dark text-white flex-shrink-0 transition-colors"
      >
        <Send className="h-[18px] w-[18px] rotate-180" />
      </Button>
    </div>
  );
}
