const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { query } = require("./db");
const { createHttpError, readBearerToken } = require("./http");
const { getUserById, runQuery } = require("./users");

const SESSION_DURATION_DAYS = Number(process.env.INTROVIBE_SESSION_DAYS || 30);
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

const hashPassword = async (password) => bcrypt.hash(password, BCRYPT_ROUNDS);
const verifyPassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);
const hashSessionToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createSession = async (executor, userId) => {
  const sessionId = crypto.randomUUID();
  const sessionToken = crypto.randomBytes(32).toString("hex");

  await runQuery(
    executor,
    `INSERT INTO user_sessions (
       id,
       user_id,
       token_hash,
       expires_at,
       last_used_at
     )
     VALUES (
       ?,
       ?,
       ?,
       DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY),
       UTC_TIMESTAMP()
     )`,
    [sessionId, userId, hashSessionToken(sessionToken), SESSION_DURATION_DAYS]
  );

  await runQuery(
    executor,
    `UPDATE users
     SET presence_status = 'online',
         last_active_at = UTC_TIMESTAMP(),
         last_logout_at = NULL
     WHERE id = ?`,
    [userId]
  );

  return sessionToken;
};

const resolveSession = async (req, executor = query) => {
  const sessionToken = readBearerToken(req);

  if (!sessionToken) {
    return null;
  }

  const rows = await runQuery(
    executor,
    `SELECT id, user_id
     FROM user_sessions
     WHERE token_hash = ?
       AND revoked_at IS NULL
       AND expires_at > UTC_TIMESTAMP()
     LIMIT 1`,
    [hashSessionToken(sessionToken)]
  );

  if (!rows.length) {
    return null;
  }

  const session = rows[0];

  await runQuery(
    executor,
    `UPDATE user_sessions
     SET last_used_at = UTC_TIMESTAMP()
     WHERE id = ?`,
    [session.id]
  );

  await runQuery(
    executor,
    `UPDATE users
     SET presence_status = 'online',
         last_active_at = UTC_TIMESTAMP(),
         last_logout_at = NULL
     WHERE id = ?`,
    [session.user_id]
  );

  const user = await getUserById(session.user_id, executor);

  if (!user) {
    return null;
  }

  return {
    sessionId: session.id,
    sessionToken,
    user,
  };
};

const requireSession = async (req, executor = query) => {
  const session = await resolveSession(req, executor);

  if (!session) {
    throw createHttpError("Authentication required.", 401);
  }

  return session;
};

const revokeSessionToken = async (sessionToken, executor = query) => {
  if (!sessionToken) {
    return false;
  }

  const rows = await runQuery(
    executor,
    `SELECT id, user_id
     FROM user_sessions
     WHERE token_hash = ?
       AND revoked_at IS NULL
     LIMIT 1`,
    [hashSessionToken(sessionToken)]
  );

  if (!rows.length) {
    return false;
  }

  const session = rows[0];

  await runQuery(
    executor,
    `UPDATE user_sessions
     SET revoked_at = UTC_TIMESTAMP()
     WHERE id = ?`,
    [session.id]
  );

  const activeSessions = await runQuery(
    executor,
    `SELECT id
     FROM user_sessions
     WHERE user_id = ?
       AND revoked_at IS NULL
       AND expires_at > UTC_TIMESTAMP()
     LIMIT 1`,
    [session.user_id]
  );

  if (!activeSessions.length) {
    await runQuery(
      executor,
      `UPDATE users
       SET presence_status = 'away',
           last_logout_at = UTC_TIMESTAMP()
       WHERE id = ?`,
      [session.user_id]
    );
  }

  return true;
};

const revokeAllSessionsForUser = async (userId, executor = query) => {
  await runQuery(
    executor,
    `UPDATE user_sessions
     SET revoked_at = UTC_TIMESTAMP()
     WHERE user_id = ?
       AND revoked_at IS NULL`,
    [userId]
  );
};

module.exports = {
  createSession,
  hashPassword,
  requireSession,
  resolveSession,
  revokeAllSessionsForUser,
  revokeSessionToken,
  verifyPassword,
};
