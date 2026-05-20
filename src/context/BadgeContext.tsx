"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Badge } from "@/lib/badges";

interface BadgeContextValue {
  pendingBadge: Badge | null;     // currently displaying badge modal
  queueBadges: (badges: Badge[]) => void;
  dismissCurrent: () => void;
  newBadgeIds: Set<string>;       // badges in unlocked_new state (for achievements page)
  markSeen: (badgeId: string) => void;
}

const BadgeContext = createContext<BadgeContextValue | null>(null);

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Badge[]>([]);
  const [pendingBadge, setPendingBadge] = useState<Badge | null>(null);
  const [newBadgeIds, setNewBadgeIds] = useState<Set<string>>(new Set());

  // Load any unlocked_new badges from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("zbd_badges");
      if (raw) {
        const states: Record<string, string> = JSON.parse(raw);
        const ids = Object.entries(states)
          .filter(([, v]) => v === "unlocked_new")
          .map(([k]) => k);
        if (ids.length > 0) setNewBadgeIds(new Set(ids));
      }
    } catch {}
  }, []);

  const queueBadges = useCallback((badges: Badge[]) => {
    setQueue(prev => [...prev, ...badges]);
    setNewBadgeIds(prev => {
      const next = new Set(prev);
      badges.forEach(b => next.add(b.id));
      return next;
    });
  }, []);

  const dismissCurrent = useCallback(() => {
    setPendingBadge(null);
  }, []);

  const markSeen = useCallback((badgeId: string) => {
    setNewBadgeIds(prev => {
      const next = new Set(prev);
      next.delete(badgeId);
      return next;
    });
    try {
      const raw = localStorage.getItem("zbd_badges");
      const states = raw ? JSON.parse(raw) : {};
      if (states[badgeId] === "unlocked_new") {
        states[badgeId] = "unlocked_seen";
        localStorage.setItem("zbd_badges", JSON.stringify(states));
      }
    } catch {}
  }, []);

  // Process queue: show next badge after current is dismissed
  useEffect(() => {
    if (!pendingBadge && queue.length > 0) {
      const [next, ...rest] = queue;
      setPendingBadge(next);
      setQueue(rest);
    }
  }, [pendingBadge, queue]);

  return (
    <BadgeContext.Provider value={{ pendingBadge, queueBadges, dismissCurrent, newBadgeIds, markSeen }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadge() {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error("useBadge must be used within BadgeProvider");
  return ctx;
}
