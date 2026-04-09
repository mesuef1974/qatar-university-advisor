"use client";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export default function SuggestionChips({
  suggestions,
  onSelect,
}: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 mb-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold bg-maroon-light dark:bg-maroon/10 text-maroon dark:text-primary border border-maroon/15 dark:border-primary/20 hover:bg-maroon/10 dark:hover:bg-maroon/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
