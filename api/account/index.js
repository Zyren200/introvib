const { withTransaction } = require("../_lib/db");
const { requireSession } = require("../_lib/auth");
const { ensureMethod, handleApiError, sendJson } = require("../_lib/http");
const { runQuery } = require("../_lib/users");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["DELETE"])) {
    return;
  }

  try {
    await withTransaction(async (connection) => {
      const session = await requireSession(req, connection);

      await runQuery(connection, `DELETE FROM users WHERE id = ?`, [session.user.id]);
    });

    sendJson(res, 200, {
      success: true,
      mode: "railway-api",
    });
  } catch (error) {
    handleApiError(res, error);
  }
};
