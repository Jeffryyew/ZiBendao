// ─── Badge System ──────────────────────────────────────────────────────────────

export type BadgeTier = "online" | "offline" | "ultimate";
export type BadgeState = "locked" | "unlocked_new" | "unlocked_seen";

export interface Badge {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  order: number;
  color: string; // accent color
  requiredLessons?: string[];
  requiredRole?: string;
}

// ─── All 24 lessons in order ───────────────────────────────────────────────────
export const LESSON_ORDER: string[] = [
  "m1-l1", "m1-l2", "m1-l3",     // Module 1 (lessons 1-3)
  "m2-l1", "m2-l2",               // Module 2 (lessons 4-5)
  "m3-l1", "m3-l2",               // Module 3 (lessons 6-7)
  "m4-l1", "m4-l2", "m4-l3",     // Module 4 (lessons 8-10)
  "m5-l1", "m5-l2",               // Module 5 (lessons 11-12)
  "m6-l1", "m6-l2",               // Module 6 (lessons 13-14)
  "m7-l1", "m7-l2",               // Module 7 (lessons 15-16)
  "m8-l1", "m8-l2",               // Module 8 (lessons 17-18)
  "m9-l1", "m9-l2",               // Module 9 (lessons 19-20)
  "m10-l1", "m10-l2",             // Module 10 (lessons 21-22)
  "m11-l1", "m11-l2",             // Module 11 (lessons 23-24)
];

// ─── 12 Online Growth Badges (every 2 lessons) ─────────────────────────────────
export const ONLINE_BADGES: Badge[] = [
  {
    id: "online_01", name: "启航者", nameEn: "Pioneer",
    description: "完成第1-2关课程，开启资本之旅",
    icon: "🚀", tier: "online", order: 1, color: "#EF4444",
    requiredLessons: ["m1-l1", "m1-l2"],
  },
  {
    id: "online_02", name: "探索者", nameEn: "Explorer",
    description: "完成第3-4关课程，探索资本运作逻辑",
    icon: "🧭", tier: "online", order: 2, color: "#F97316",
    requiredLessons: ["m1-l3", "m2-l1"],
  },
  {
    id: "online_03", name: "洞察者", nameEn: "Insighter",
    description: "完成第5-6关课程，洞察商业本质",
    icon: "👁️", tier: "online", order: 3, color: "#F59E0B",
    requiredLessons: ["m2-l2", "m3-l1"],
  },
  {
    id: "online_04", name: "构建者", nameEn: "Builder",
    description: "完成第7-8关课程，构建商业模型",
    icon: "🏗️", tier: "online", order: 4, color: "#EAB308",
    requiredLessons: ["m3-l2", "m4-l1"],
  },
  {
    id: "online_05", name: "估值者", nameEn: "Valuator",
    description: "完成第9-10关课程，掌握估值方法",
    icon: "📊", tier: "online", order: 5, color: "#84CC16",
    requiredLessons: ["m4-l2", "m4-l3"],
  },
  {
    id: "online_06", name: "结构师", nameEn: "Architect",
    description: "完成第11-12关课程，设计资本结构",
    icon: "🏛️", tier: "online", order: 6, color: "#22C55E",
    requiredLessons: ["m5-l1", "m5-l2"],
  },
  {
    id: "online_07", name: "策略家", nameEn: "Strategist",
    description: "完成第13-14关课程，制定资本策略",
    icon: "♟️", tier: "online", order: 7, color: "#10B981",
    requiredLessons: ["m6-l1", "m6-l2"],
  },
  {
    id: "online_08", name: "融资家", nameEn: "Fundraiser",
    description: "完成第15-16关课程，融资实战演练",
    icon: "💰", tier: "online", order: 8, color: "#3B82F6",
    requiredLessons: ["m7-l1", "m7-l2"],
  },
  {
    id: "online_09", name: "资本家", nameEn: "Capitalist",
    description: "完成第17-18关课程，运用资本思维",
    icon: "💎", tier: "online", order: 9, color: "#6366F1",
    requiredLessons: ["m8-l1", "m8-l2"],
  },
  {
    id: "online_10", name: "扩张者", nameEn: "Expander",
    description: "完成第19-20关课程，掌握扩张之道",
    icon: "🌐", tier: "online", order: 10, color: "#8B5CF6",
    requiredLessons: ["m9-l1", "m9-l2"],
  },
  {
    id: "online_11", name: "价值创造者", nameEn: "Value Creator",
    description: "完成第21-22关课程，创造持续价值",
    icon: "👑", tier: "online", order: 11, color: "#A855F7",
    requiredLessons: ["m10-l1", "m10-l2"],
  },
  {
    id: "online_12", name: "资本精英", nameEn: "Capital Elite",
    description: "完成全部24关课程，成为资本精英",
    icon: "⚡", tier: "online", order: 12, color: "#EC4899",
    requiredLessons: ["m11-l1", "m11-l2"],
  },
];

// ─── 3 Offline Course Badges ───────────────────────────────────────────────────
export const OFFLINE_BADGES: Badge[] = [
  {
    id: "offline_zibentong", name: "资本通", nameEn: "Capital Pro",
    description: "完成《资本通》线下课程，掌握资本认知与价值估值",
    icon: "🏦", tier: "offline", order: 13, color: "#F59E0B",
    requiredRole: "ZIBENTONG_GRAD",
  },
  {
    id: "offline_qidong", name: "启动资本", nameEn: "Capital Launch",
    description: "完成《启动资本》线下课程，掌握企业融资与资本架构",
    icon: "⚡", tier: "offline", order: 14, color: "#3B82F6",
    requiredRole: "QIDONG_GRAD",
  },
  {
    id: "offline_zibendao", name: "资本道", nameEn: "Capital Way",
    description: "完成《资本道》线下课程，掌握资本运营与上市路径",
    icon: "🌟", tier: "offline", order: 15, color: "#8B5CF6",
    requiredRole: "ZIBENDAO_GRAD",
  },
];

// ─── Ultimate Badge ────────────────────────────────────────────────────────────
export const ULTIMATE_BADGE: Badge = {
  id: "ultimate",
  name: "资本大师",
  nameEn: "Capital Master",
  description: "完成全部线上与线下课程，成为真正的资本大师",
  icon: "🏆",
  tier: "ultimate",
  order: 16,
  color: "#F59E0B",
};

export const ALL_BADGES: Badge[] = [...ONLINE_BADGES, ...OFFLINE_BADGES, ULTIMATE_BADGE];

// ─── Logic ─────────────────────────────────────────────────────────────────────

/** Which online badges has this user earned? */
export function getEarnedOnlineBadgeIds(completedLessonIds: string[]): string[] {
  const set = new Set(completedLessonIds);
  return ONLINE_BADGES
    .filter(b => b.requiredLessons!.every(id => set.has(id)))
    .map(b => b.id);
}

/** Get which badges are newly unlocked after completing a lesson. */
export function checkNewBadges(
  completedIds: string[],
  currentStates: Record<string, BadgeState>,
  role?: string
): Badge[] {
  const newBadges: Badge[] = [];

  // Online
  const earnedIds = new Set(getEarnedOnlineBadgeIds(completedIds));
  for (const badge of ONLINE_BADGES) {
    if (earnedIds.has(badge.id) && (!currentStates[badge.id] || currentStates[badge.id] === "locked")) {
      newBadges.push(badge);
    }
  }

  // Offline (by role)
  if (role) {
    for (const badge of OFFLINE_BADGES) {
      if (badge.requiredRole === role && (!currentStates[badge.id] || currentStates[badge.id] === "locked")) {
        newBadges.push(badge);
      }
    }
  }

  // Ultimate
  const hasAllOnline = ONLINE_BADGES.every(b => earnedIds.has(b.id));
  const hasAllOffline = OFFLINE_BADGES.every(b =>
    currentStates[b.id] === "unlocked_seen" || currentStates[b.id] === "unlocked_new"
  );
  const ultimateUnlocked = !currentStates["ultimate"] || currentStates["ultimate"] === "locked";
  if (hasAllOnline && hasAllOffline && ultimateUnlocked) {
    newBadges.push(ULTIMATE_BADGE);
  }

  return newBadges;
}

// ─── localStorage helpers (client-only) ───────────────────────────────────────

export function getBadgeStates(): Record<string, BadgeState> {
  try {
    const raw = localStorage.getItem("zbd_badges");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setBadgeState(badgeId: string, state: BadgeState): void {
  try {
    const states = getBadgeStates();
    states[badgeId] = state;
    localStorage.setItem("zbd_badges", JSON.stringify(states));
  } catch {}
}

export function getCompletedLessons(): string[] {
  try {
    const raw = localStorage.getItem("zbd_online_completed");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Compute badge states from current progress (on load / sync) */
export function syncBadgeStates(): Record<string, BadgeState> {
  const completed = getCompletedLessons();
  const states = getBadgeStates();
  const earned = new Set(getEarnedOnlineBadgeIds(completed));

  for (const badge of ONLINE_BADGES) {
    if (earned.has(badge.id) && !states[badge.id]) {
      states[badge.id] = "unlocked_seen"; // already earned, just not tracked yet
    } else if (!states[badge.id]) {
      states[badge.id] = "locked";
    }
  }

  try {
    localStorage.setItem("zbd_badges", JSON.stringify(states));
  } catch {}

  return states;
}
