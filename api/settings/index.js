const { ensureMethod, handleApiError, sendJson } = require("../_lib/http");
const { requireSession } = require("../_lib/auth");
const { getSettingsForUser, mergeSettings, saveSettingsForUser } = require("../_lib/settings");
const { withTransaction } = require("../_lib/db");
const { parseJsonBody } = require("../_lib/http");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["GET", "PUT"])) {
    return;
  }

  try {
    if (req.method === "GET") {
      const session = await requireSession(req);
      const settings = await getSettingsForUser(session.user.id);
      sendJson(res, 200, { mode: "railway-api", settings });
      return;
    }

    const body = await parseJsonBody(req);
    const nextSettings = await withTransaction(async (connection) => {
      const session = await requireSession(req, connection);
      return saveSettingsForUser(session.user.id, mergeSettings(body?.settings || {}), connection);
    });

    sendJson(res, 200, { mode: "railway-api", settings: nextSettings });
  } catch (error) {
    handleApiError(res, error);
  }
};
