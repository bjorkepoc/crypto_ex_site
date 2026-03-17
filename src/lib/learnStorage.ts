import {
  LearnState,
  LectureProgress,
  LectureId,
  ALL_LECTURE_IDS,
  XP_VALUES,
} from "@/types/learn";

const STORAGE_KEY = "cryptoex_learn";

function defaultLectureProgress(lectureId: LectureId, index: number): LectureProgress {
  return {
    lectureId,
    stage: index === 0 ? "study" : "locked",
    studySectionsRead: [],
    practiceScore: 0,
    practiceAttempts: 0,
    quizScore: 0,
    quizAttempts: 0,
    masteryStars: 0,
    xpEarned: 0,
  };
}

function defaultLearnState(): LearnState {
  const lectureProgress = {} as Record<LectureId, LectureProgress>;
  ALL_LECTURE_IDS.forEach((id, i) => {
    lectureProgress[id] = defaultLectureProgress(id, i);
  });
  return {
    lectureProgress,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    achievements: [],
  };
}

export function loadLearnState(): LearnState {
  if (typeof window === "undefined") return defaultLearnState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultLearnState();
    const parsed = JSON.parse(raw) as LearnState;
    // Ensure all lectures exist
    ALL_LECTURE_IDS.forEach((id, i) => {
      if (!parsed.lectureProgress[id]) {
        parsed.lectureProgress[id] = defaultLectureProgress(id, i);
      }
    });
    return parsed;
  } catch {
    return defaultLearnState();
  }
}

export function saveLearnState(state: LearnState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateLectureProgress(
  lectureId: LectureId,
  updater: (progress: LectureProgress) => LectureProgress
): LearnState {
  const state = loadLearnState();
  state.lectureProgress[lectureId] = updater(state.lectureProgress[lectureId]);
  state.lectureProgress[lectureId].lastActivity = Date.now();
  checkAndUpdateStreak(state);
  saveLearnState(state);
  return state;
}

export function addXp(amount: number): LearnState {
  const state = loadLearnState();
  state.totalXp += amount;
  checkAndUpdateStreak(state);
  saveLearnState(state);
  return state;
}

export function markSectionRead(lectureId: LectureId, sectionId: string): LearnState {
  const state = loadLearnState();
  const lp = state.lectureProgress[lectureId];
  if (!lp.studySectionsRead.includes(sectionId)) {
    lp.studySectionsRead.push(sectionId);
  }
  lp.lastActivity = Date.now();
  checkAndUpdateStreak(state);
  saveLearnState(state);
  return state;
}

export function completeStudy(lectureId: LectureId): LearnState {
  const state = loadLearnState();
  const lp = state.lectureProgress[lectureId];
  if (lp.stage === "study") {
    lp.stage = "practice";
    lp.xpEarned += XP_VALUES.studyComplete;
    state.totalXp += XP_VALUES.studyComplete;
    // Unlock next lecture
    unlockNextLecture(state, lectureId);
  }
  lp.lastActivity = Date.now();
  checkAndUpdateStreak(state);
  saveLearnState(state);
  return state;
}

export function recordPracticeResult(
  lectureId: LectureId,
  score: number,
  total: number
): LearnState {
  const state = loadLearnState();
  const lp = state.lectureProgress[lectureId];
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  lp.practiceAttempts++;
  if (pct > lp.practiceScore) {
    lp.practiceScore = pct;
  }
  if (pct >= 70 && (lp.stage === "practice" || lp.stage === "study")) {
    lp.stage = "quiz";
  }
  lp.lastActivity = Date.now();
  checkAndUpdateStreak(state);
  saveLearnState(state);
  return state;
}

export function recordQuizResult(
  lectureId: LectureId,
  score: number,
  total: number
): LearnState {
  const state = loadLearnState();
  const lp = state.lectureProgress[lectureId];
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  lp.quizAttempts++;
  if (pct > lp.quizScore) {
    lp.quizScore = pct;
  }

  // Update stars
  if (pct >= 95) {
    lp.masteryStars = 3;
    if (lp.stage !== "mastered") {
      state.totalXp += XP_VALUES.quizThreeStar;
      lp.xpEarned += XP_VALUES.quizThreeStar;
    }
    lp.stage = "mastered";
  } else if (pct >= 80) {
    if (lp.masteryStars < 2) lp.masteryStars = 2;
    if (lp.stage !== "mastered") {
      state.totalXp += XP_VALUES.quizTwoStar;
      lp.xpEarned += XP_VALUES.quizTwoStar;
    }
    lp.stage = "mastered";
  } else if (pct >= 60) {
    if (lp.masteryStars < 1) lp.masteryStars = 1;
    if (lp.stage !== "mastered") {
      state.totalXp += XP_VALUES.quizPass;
      lp.xpEarned += XP_VALUES.quizPass;
    }
    lp.stage = "mastered";
  }

  lp.lastActivity = Date.now();
  checkAndUpdateStreak(state);
  saveLearnState(state);
  return state;
}

function unlockNextLecture(state: LearnState, currentLectureId: LectureId): void {
  const idx = ALL_LECTURE_IDS.indexOf(currentLectureId);
  if (idx >= 0 && idx < ALL_LECTURE_IDS.length - 1) {
    const nextId = ALL_LECTURE_IDS[idx + 1];
    if (state.lectureProgress[nextId].stage === "locked") {
      state.lectureProgress[nextId].stage = "study";
    }
  }
}

function checkAndUpdateStreak(state: LearnState): void {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastActivityDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (state.lastActivityDate === yesterday) {
    state.currentStreak++;
    state.totalXp += XP_VALUES.dailyStreak;
  } else if (state.lastActivityDate !== "") {
    state.currentStreak = 1;
  } else {
    state.currentStreak = 1;
  }

  if (state.currentStreak > state.longestStreak) {
    state.longestStreak = state.currentStreak;
  }
  state.lastActivityDate = today;
}

export function wipeLearnProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
