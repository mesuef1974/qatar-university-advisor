import { create } from "zustand";
import { useEffect, useState } from "react";

export interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  suggestions?: string[];
  source?: string;
  time: string;
}

export interface UserProfile {
  nationality: "qatari" | "non_qatari" | null;
  grade: number | null;
  track: string | null;
  favorites: string[];
}

interface ChatState {
  messages: ChatMessage[];
  input: string;
  isTyping: boolean;
  userProfile: UserProfile;
  activeView: "chat" | "universities" | "compare" | "scholarships" | "admin";
  sidebarOpen: boolean;

  setInput: (input: string) => void;
  setIsTyping: (typing: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  setActiveView: (view: ChatState["activeView"]) => void;
  setSidebarOpen: (open: boolean) => void;
  setNationality: (nat: "qatari" | "non_qatari") => void;
  toggleFavorite: (uniId: string) => void;
  setGrade: (grade: number) => void;
  setTrack: (track: string) => void;
  clearMessages: () => void;
  _setFavorites: (favs: string[]) => void;
}

function getTimeString(): string {
  return new Date().toLocaleTimeString("ar-QA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  input: "",
  isTyping: false,
  userProfile: {
    nationality: null,
    grade: null,
    track: null,
    favorites: [],
  },
  activeView: "chat",
  sidebarOpen: false,

  setInput: (input) => set({ input }),
  setIsTyping: (isTyping) => set({ isTyping }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setActiveView: (activeView) => set({ activeView, sidebarOpen: false }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  setNationality: (nationality) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("advisor_nationality", nationality);
    }
    set((state) => ({
      userProfile: { ...state.userProfile, nationality },
    }));
  },

  toggleFavorite: (uniId) =>
    set((state) => {
      const favs = state.userProfile.favorites.includes(uniId)
        ? state.userProfile.favorites.filter((f) => f !== uniId)
        : [...state.userProfile.favorites, uniId];
      if (typeof window !== "undefined") {
        localStorage.setItem("advisor_favorites", JSON.stringify(favs));
      }
      return { userProfile: { ...state.userProfile, favorites: favs } };
    }),

  setGrade: (grade) =>
    set((state) => ({
      userProfile: { ...state.userProfile, grade },
    })),

  setTrack: (track) =>
    set((state) => ({
      userProfile: { ...state.userProfile, track },
    })),

  clearMessages: () => set({ messages: [] }),

  _setFavorites: (favs) =>
    set((state) => ({
      userProfile: { ...state.userProfile, favorites: favs },
    })),
}));

/**
 * Hook to hydrate the store from localStorage after mount.
 * Prevents hydration mismatch by ensuring server and client
 * both start with null/[] initial values.
 */
export function useHydrateStore() {
  const setNationality = useChatStore((s) => s.setNationality);
  const _setFavorites = useChatStore((s) => s._setFavorites);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedNat = localStorage.getItem("advisor_nationality");
      if (storedNat === "qatari" || storedNat === "non_qatari") {
        setNationality(storedNat);
      }
    } catch {
      /* noop */
    }

    try {
      const storedFavs = localStorage.getItem("advisor_favorites");
      if (storedFavs) {
        const favs = JSON.parse(storedFavs);
        if (Array.isArray(favs)) {
          _setFavorites(favs);
        }
      }
    } catch {
      /* noop */
    }

    setHydrated(true);
  }, [setNationality, _setFavorites]);

  return hydrated;
}

export function createBotMessage(
  text: string,
  suggestions?: string[],
  source?: string
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "bot",
    content: text,
    suggestions,
    source,
    time: getTimeString(),
  };
}

export function createUserMessage(text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "user",
    content: text,
    time: getTimeString(),
  };
}
