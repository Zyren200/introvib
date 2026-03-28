export const STATS_KEY = "isfEaseStats";
export const QUIET_STATE_KEY = "isfEaseQuietState";

export const DEFAULT_STATS = {
  learningMinutes: 0,
  quietSessions: 0,
  reflections: 0,
};

export const DEFAULT_QUIET_STATE = {
  enabled: false,
  until: null,
  pendingNotifications: [],
  lastReminderAt: null,
};

export const normalizeStats = (stats = {}) => ({
  learningMinutes: Number(stats?.learningMinutes) || 0,
  quietSessions: Number(stats?.quietSessions) || 0,
  reflections: Number(stats?.reflections) || 0,
});

export const normalizeQuietState = (quietState = {}) => ({
  enabled: Boolean(quietState?.enabled),
  until: Number.isFinite(Number(quietState?.until)) ? Number(quietState.until) : null,
  pendingNotifications: Array.isArray(quietState?.pendingNotifications)
    ? quietState.pendingNotifications
    : [],
  lastReminderAt: Number.isFinite(Number(quietState?.lastReminderAt))
    ? Number(quietState.lastReminderAt)
    : null,
});

export const loadLegacyStats = () => {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      return normalizeStats(JSON.parse(saved));
    }
  } catch (error) {
    console.error("Failed to load legacy IntroVibe stats", error);
  }

  return { ...DEFAULT_STATS };
};

export const loadLegacyQuietState = () => {
  try {
    const saved = localStorage.getItem(QUIET_STATE_KEY);
    if (saved) {
      return normalizeQuietState(JSON.parse(saved));
    }
  } catch (error) {
    console.error("Failed to load legacy IntroVibe quiet state", error);
  }

  return { ...DEFAULT_QUIET_STATE };
};

export const persistLegacyStats = (stats) => {
  const nextStats = normalizeStats(stats);

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(nextStats));
  } catch (error) {
    console.error("Failed to persist legacy IntroVibe stats", error);
  }

  return nextStats;
};

export const persistLegacyQuietState = (quietState) => {
  const nextQuietState = normalizeQuietState(quietState);

  try {
    localStorage.setItem(QUIET_STATE_KEY, JSON.stringify(nextQuietState));
  } catch (error) {
    console.error("Failed to persist legacy IntroVibe quiet state", error);
  }

  return nextQuietState;
};
