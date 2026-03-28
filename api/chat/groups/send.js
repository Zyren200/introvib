const { withTransaction } = require("../../_lib/db");
const { requireSession } = require("../../_lib/auth");
const { ensureMethod, handleApiError, parseJsonBody, sendJson } = require("../../_lib/http");
const { sendGroupMessage } = require("../../_lib/chat");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const chatState = await withTransaction(async (connection) => {
      const session = await requireSession(req, connection);
      return sendGroupMessage(session.user.id, body?.groupId, body, connection);
    });

    sendJson(res, 200, { mode: "railway-api", ...chatState });
  } catch (error) {
    handleApiError(res, error);
  }
};
