const { query } = require("./db");
const { runQuery } = require("./users");

const DEFAULT_SETTINGS = {
  appearance: {
    theme: "light",
  },
  quietMode: {
    enabled: false,
    startTime: "22:00",
    endTime: "07:00",
    daysOfWeek: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
  },
  sessionTimer: {
    duration: 30,
    breakReminder: true,
    breakDuration: 5,
    autoStart: false,
    soundEnabled: true,
  },
  notifications: {
    messageAlerts: true,
    matchSuggestions: true,
    systemUpdates: false,
    emailNotifications: false,
    quietHoursRespect: true,
  },
  account: {
    email: "",
    twoFactorEnabled: false,
    dataExportRequested: false,
  },
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

const normalizeTime = (value, fallback) => {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return value.slice(0, 5);
};

const mergeSettings = (settings = {}) => ({
  ...DEFAULT_SETTINGS,
  ...settings,
  appearance: {
    ...DEFAULT_SETTINGS.appearance,
    ...(settings?.appearance || {}),
  },
  quietMode: {
    ...DEFAULT_SETTINGS.quietMode,
    ...(settings?.quietMode || {}),
    daysOfWeek: Array.isArray(settings?.quietMode?.daysOfWeek)
      ? settings.quietMode.daysOfWeek
      : DEFAULT_SETTINGS.quietMode.daysOfWeek,
  },
  sessionTimer: {
    ...DEFAULT_SETTINGS.sessionTimer,
    ...(settings?.sessionTimer || {}),
  },
  notifications: {
    ...DEFAULT_SETTINGS.notifications,
    ...(settings?.notifications || {}),
  },
  account: {
    ...DEFAULT_SETTINGS.account,
    ...(settings?.account || {}),
  },
});

const ensureSettingsRow = async (userId, executor = query) => {
  await runQuery(executor, `INSERT IGNORE INTO user_settings (user_id) VALUES (?)`, [userId]);
};

const mapSettingsRow = (row, email = "") => {
  const settings = mergeSettings({
    appearance: {
      theme: row?.theme_mode || DEFAULT_SETTINGS.appearance.theme,
    },
    quietMode: {
      enabled: Boolean(row?.quiet_mode_enabled),
      startTime: normalizeTime(row?.quiet_mode_start, DEFAULT_SETTINGS.quietMode.startTime),
      endTime: normalizeTime(row?.quiet_mode_end, DEFAULT_SETTINGS.quietMode.endTime),
      daysOfWeek: parseJsonValue(row?.quiet_mode_days, DEFAULT_SETTINGS.quietMode.daysOfWeek),
    },
    sessionTimer: {
      duration: Number(row?.session_duration_minutes) || DEFAULT_SETTINGS.sessionTimer.duration,
      breakReminder: Boolean(row?.break_reminder_enabled),
      breakDuration: Number(row?.break_duration_minutes) || DEFAULT_SETTINGS.sessionTimer.breakDuration,
      autoStart: Boolean(row?.auto_start_timer),
      soundEnabled: Boolean(row?.sound_enabled),
    },
    notifications: {
      messageAlerts: Boolean(row?.message_alerts),
      matchSuggestions: Boolean(row?.match_suggestions),
      systemUpdates: Boolean(row?.system_updates),
      emailNotifications: Boolean(row?.email_notifications),
      quietHoursRespect: Boolean(row?.quiet_hours_respect),
    },
    account: {
      email,
      twoFactorEnabled: Boolean(row?.two_factor_enabled),
      dataExportRequested: Boolean(row?.data_export_requested),
    },
  });

  if (!Array.isArray(settings.quietMode.daysOfWeek)) {
    settings.quietMode.daysOfWeek = [...DEFAULT_SETTINGS.quietMode.daysOfWeek];
  }

  return settings;
};

const getSettingsForUser = async (userId, executor = query) => {
  await ensureSettingsRow(userId, executor);

  const rows = await runQuery(
    executor,
    `SELECT us.*, u.email
     FROM user_settings us
     INNER JOIN users u ON u.id = us.user_id
     WHERE us.user_id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    return mergeSettings({
      account: {
        email: "",
      },
    });
  }

  return mapSettingsRow(rows[0], rows[0].email || "");
};

const saveSettingsForUser = async (userId, settings, executor = query) => {
  const nextSettings = mergeSettings(settings);

  await runQuery(
    executor,
    `INSERT INTO user_settings (
       user_id,
       theme_mode,
       quiet_mode_enabled,
       quiet_mode_start,
       quiet_mode_end,
       quiet_mode_days,
       session_duration_minutes,
       break_reminder_enabled,
       break_duration_minutes,
       auto_start_timer,
       sound_enabled,
       message_alerts,
       match_suggestions,
       system_updates,
       email_notifications,
       quiet_hours_respect,
       two_factor_enabled,
       data_export_requested
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       theme_mode = VALUES(theme_mode),
       quiet_mode_enabled = VALUES(quiet_mode_enabled),
       quiet_mode_start = VALUES(quiet_mode_start),
       quiet_mode_end = VALUES(quiet_mode_end),
       quiet_mode_days = VALUES(quiet_mode_days),
       session_duration_minutes = VALUES(session_duration_minutes),
       break_reminder_enabled = VALUES(break_reminder_enabled),
       break_duration_minutes = VALUES(break_duration_minutes),
       auto_start_timer = VALUES(auto_start_timer),
       sound_enabled = VALUES(sound_enabled),
       message_alerts = VALUES(message_alerts),
       match_suggestions = VALUES(match_suggestions),
       system_updates = VALUES(system_updates),
       email_notifications = VALUES(email_notifications),
       quiet_hours_respect = VALUES(quiet_hours_respect),
       two_factor_enabled = VALUES(two_factor_enabled),
       data_export_requested = VALUES(data_export_requested),
       updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      nextSettings.appearance.theme,
      Number(Boolean(nextSettings.quietMode.enabled)),
      nextSettings.quietMode.startTime,
      nextSettings.quietMode.endTime,
      JSON.stringify(nextSettings.quietMode.daysOfWeek || []),
      Number(nextSettings.sessionTimer.duration) || DEFAULT_SETTINGS.sessionTimer.duration,
      Number(Boolean(nextSettings.sessionTimer.breakReminder)),
      Number(nextSettings.sessionTimer.breakDuration) || DEFAULT_SETTINGS.sessionTimer.breakDuration,
      Number(Boolean(nextSettings.sessionTimer.autoStart)),
      Number(Boolean(nextSettings.sessionTimer.soundEnabled)),
      Number(Boolean(nextSettings.notifications.messageAlerts)),
      Number(Boolean(nextSettings.notifications.matchSuggestions)),
      Number(Boolean(nextSettings.notifications.systemUpdates)),
      Number(Boolean(nextSettings.notifications.emailNotifications)),
      Number(Boolean(nextSettings.notifications.quietHoursRespect)),
      Number(Boolean(nextSettings.account.twoFactorEnabled)),
      Number(Boolean(nextSettings.account.dataExportRequested)),
    ]
  );

  return getSettingsForUser(userId, executor);
};

module.exports = {
  DEFAULT_SETTINGS,
  getSettingsForUser,
  mergeSettings,
  saveSettingsForUser,
};
