const { getInterestAffinity, uniqueInterests } = require("./personality");
const { query } = require("./db");

const runQuery = async (executor, sql, params = []) => {
  if (typeof executor === "function") {
    return executor(sql, params);
  }

  const [rows] = await executor.execute(sql, params);
  return rows;
};

const mapUserRow = (row, extras = {}) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  avatarId: Number(row.avatar_id) || 1,
  predictedPersonality: row.predicted_personality || null,
  personalityType: row.personality_type || null,
  assessmentCompleted: Boolean(row.assessment_completed),
  sudokuCompleted: Boolean(row.sudoku_completed),
  interests: extras.interests || [],
  assessmentAnswers: extras.assessmentAnswers || [],
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  presence: {
    status: row.presence_status || "offline",
    lastActiveAt: row.last_active_at ? new Date(row.last_active_at).getTime() : null,
    lastLogoutAt: row.last_logout_at ? new Date(row.last_logout_at).getTime() : null,
  },
});

const getUserInterests = async (userId, executor = query) => {
  const rows = await runQuery(
    executor,
    `SELECT i.name
     FROM user_interests ui
     INNER JOIN interests i ON i.id = ui.interest_id
     WHERE ui.user_id = ?
     ORDER BY i.name ASC`,
    [userId]
  );

  return rows.map((row) => row.name);
};

const getLatestAssessmentAnswers = async (userId, executor = query) => {
  const latestAssessment = await runQuery(
    executor,
    `SELECT id
     FROM personality_assessments
     WHERE user_id = ?
     ORDER BY completed_at DESC, created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (!latestAssessment.length) {
    return [];
  }

  const rows = await runQuery(
    executor,
    `SELECT paa.answer_code
     FROM personality_assessment_answers paa
     INNER JOIN personality_questions pq ON pq.id = paa.question_id
     WHERE paa.assessment_id = ?
     ORDER BY pq.display_order ASC`,
    [latestAssessment[0].id]
  );

  return rows.map((row) => row.answer_code);
};

const getUserById = async (userId, executor = query) => {
  const rows = await runQuery(
    executor,
    `SELECT
       id,
       username,
       email,
       avatar_id,
       predicted_personality,
       personality_type,
       assessment_completed,
       sudoku_completed,
       presence_status,
       last_active_at,
       last_logout_at,
       created_at
     FROM users
     WHERE id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    return null;
  }

  const [interests, assessmentAnswers] = await Promise.all([
    getUserInterests(userId, executor),
    getLatestAssessmentAnswers(userId, executor),
  ]);

  return mapUserRow(rows[0], {
    interests,
    assessmentAnswers,
  });
};

const listUsers = async (executor = query) => {
  const userRows = await runQuery(
    executor,
    `SELECT
       id,
       username,
       email,
       avatar_id,
       predicted_personality,
       personality_type,
       assessment_completed,
       sudoku_completed,
       presence_status,
       last_active_at,
       last_logout_at,
       created_at
     FROM users
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC`
  );

  if (!userRows.length) {
    return [];
  }

  const interestRows = await runQuery(
    executor,
    `SELECT ui.user_id, i.name
     FROM user_interests ui
     INNER JOIN interests i ON i.id = ui.interest_id
     INNER JOIN users u ON u.id = ui.user_id
     WHERE u.deleted_at IS NULL
     ORDER BY i.name ASC`
  );

  const interestsByUser = interestRows.reduce((accumulator, row) => {
    if (!accumulator[row.user_id]) {
      accumulator[row.user_id] = [];
    }

    accumulator[row.user_id].push(row.name);
    return accumulator;
  }, {});

  return userRows.map((row) =>
    mapUserRow(row, {
      interests: interestsByUser[row.id] || [],
    })
  );
};

const syncUserInterests = async (executor, userId, interests = []) => {
  const normalizedInterests = uniqueInterests(interests);

  await runQuery(executor, `DELETE FROM user_interests WHERE user_id = ?`, [userId]);

  if (!normalizedInterests.length) {
    return [];
  }

  const insertInterestSql = normalizedInterests.map(() => "(?, ?, ?)").join(", ");
  const interestParams = normalizedInterests.flatMap((interest) => [
    interest,
    getInterestAffinity(interest),
    0,
  ]);

  await runQuery(
    executor,
    `INSERT INTO interests (name, personality_affinity, is_system_defined)
     VALUES ${insertInterestSql}
     ON DUPLICATE KEY UPDATE
       personality_affinity = VALUES(personality_affinity)`,
    interestParams
  );

  const interestIdRows = await runQuery(
    executor,
    `SELECT id, name
     FROM interests
     WHERE name IN (${normalizedInterests.map(() => "?").join(", ")})`,
    normalizedInterests
  );

  if (!interestIdRows.length) {
    return [];
  }

  const userInterestSql = interestIdRows.map(() => "(?, ?)").join(", ");
  const userInterestParams = interestIdRows.flatMap((row) => [userId, row.id]);

  await runQuery(
    executor,
    `INSERT INTO user_interests (user_id, interest_id)
     VALUES ${userInterestSql}`,
    userInterestParams
  );

  return normalizedInterests;
};

module.exports = {
  getUserById,
  listUsers,
  mapUserRow,
  runQuery,
  syncUserInterests,
};
