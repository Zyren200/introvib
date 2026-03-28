const { query } = require("./db");
const { runQuery } = require("./users");

const DEFAULT_STATS = {
  learningMinutes: 0,
  quietSessions: 0,
  reflections: 0,
};

const DEFAULT_QUIET_STATE = {
  enabled: false,
  until: null,
  pendingNotifications: [],
  lastReminderAt: null,
};

const parseJsonValue = (value, fallback) => {
  if (!value) return fallback;

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeStats = (stats = {}) => ({
  learningMinutes: Number(stats?.learningMinutes) || 0,
  quietSessions: Number(stats?.quietSessions) || 0,
  reflections: Number(stats?.reflections) || 0,
});

const normalizeQuietState = (quietState = {}) => ({
  enabled: Boolean(quietState?.enabled),
  until: Number.isFinite(Number(quietState?.until)) ? Number(quietState.until) : null,
  pendingNotifications: Array.isArray(quietState?.pendingNotifications)
    ? quietState.pendingNotifications
    : [],
  lastReminderAt: Number.isFinite(Number(quietState?.lastReminderAt))
    ? Number(quietState.lastReminderAt)
    : null,
});

const ensureAppStateRow = async (userId, executor = query) => {
  await runQuery(executor, `INSERT IGNORE INTO user_app_state (user_id) VALUES (?)`, [userId]);
};

const getAppStateForUser = async (userId, executor = query) => {
  await ensureAppStateRow(userId, executor);

  const rows = await runQuery(
    executor,
    `SELECT stats_json, quiet_state_json
     FROM user_app_state
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    return {
      stats: { ...DEFAULT_STATS },
      quietState: { ...DEFAULT_QUIET_STATE },
    };
  }

  return {
    stats: normalizeStats(parseJsonValue(rows[0].stats_json, DEFAULT_STATS)),
    quietState: normalizeQuietState(parseJsonValue(rows[0].quiet_state_json, DEFAULT_QUIET_STATE)),
  };
};

const saveAppStateForUser = async (userId, appState, executor = query) => {
  const stats = normalizeStats(appState?.stats || DEFAULT_STATS);
  const quietState = normalizeQuietState(appState?.quietState || DEFAULT_QUIET_STATE);

  await runQuery(
    executor,
    `INSERT INTO user_app_state (
       user_id,
       stats_json,
       quiet_state_json
     )
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       stats_json = VALUES(stats_json),
       quiet_state_json = VALUES(quiet_state_json),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, JSON.stringify(stats), JSON.stringify(quietState)]
  );

  return {
    stats,
    quietState,
  };
};

module.exports = {
  DEFAULT_QUIET_STATE,
  DEFAULT_STATS,
  getAppStateForUser,
  normalizeQuietState,
  normalizeStats,
  saveAppStateForUser,
};
