"use client";

export default function TypingIndicator() {
  return (
    <div className="flex justify-end mb-3 px-4">
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-[11px] text-muted-foreground mr-2">
            يكتب...
          </span>
        </div>
      </div>
    </div>
  );
}
