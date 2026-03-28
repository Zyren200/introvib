const { withTransaction } = require("../_lib/db");
const { requireSession } = require("../_lib/auth");
const { ensureMethod, handleApiError, sendJson } = require("../_lib/http");
const { listMatchesForUser } = require("../_lib/matches");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
  }

  try {
    const matches = await withTransaction(async (connection) => {
      const session = await requireSession(req, connection);
      return listMatchesForUser(session.user.id, connection);
    });

    sendJson(res, 200, {
      mode: "railway-api",
      matches,
      generatedAt: Date.now(),
    });
  } catch (error) {
    handleApiError(res, error);
  }
};