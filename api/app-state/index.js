const { ensureMethod, handleApiError, parseJsonBody, sendJson } = require("../_lib/http");
const { requireSession } = require("../_lib/auth");
const { getAppStateForUser, saveAppStateForUser } = require("../_lib/appState");
const { withTransaction } = require("../_lib/db");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["GET", "PUT"])) {
    return;
  }

  try {
    if (req.method === "GET") {
      const session = await requireSession(req);
      const appState = await getAppStateForUser(session.user.id);
      sendJson(res, 200, { mode: "railway-api", ...appState });
      return;
    }

    const body = await parseJsonBody(req);
    const appState = await withTransaction(async (connection) => {
      const session = await requireSession(req, connection);
      return saveAppStateForUser(session.user.id, body, connection);
    });

    sendJson(res, 200, { mode: "railway-api", ...appState });
  } catch (error) {
    handleApiError(res, error);
  }
};
