const { withTransaction } = require("../_lib/db");
const { createSession, verifyPassword } = require("../_lib/auth");
const { createHttpError, ensureMethod, handleApiError, parseJsonBody, sendJson } = require("../_lib/http");
const { getUserById, listUsers, runQuery } = require("../_lib/users");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const username = body?.username?.trim() || "";
    const password = body?.password || "";

    if (!username || !password) {
      throw createHttpError("Username and password are required.", 400);
    }

    const { sessionToken, user } = await withTransaction(async (connection) => {
      const rows = await runQuery(
        connection,
        `SELECT id, password_hash
         FROM users
         WHERE deleted_at IS NULL
           AND LOWER(username) = LOWER(?)
         LIMIT 1`,
        [username]
      );

      if (!rows.length) {
        throw createHttpError("Invalid credentials. Please sign up if you are new.", 401);
      }

      const [matchedUser] = rows;
      const passwordIsValid = await verifyPassword(password, matchedUser.password_hash);

      if (!passwordIsValid) {
        throw createHttpError("Invalid credentials. Please sign up if you are new.", 401);
      }

      const nextSessionToken = await createSession(connection, matchedUser.id);
      const nextUser = await getUserById(matchedUser.id, connection);

      return {
        sessionToken: nextSessionToken,
        user: nextUser,
      };
    });

    const users = await listUsers();

    sendJson(res, 200, {
      mode: "railway-api",
      sessionToken,
      user,
      users,
    });
  } catch (error) {
    handleApiError(res, error);
  }
};
