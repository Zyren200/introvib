const { withTransaction } = require("../../_lib/db");
const { requireSession } = require("../../_lib/auth");
const { ensureMethod, handleApiError, parseJsonBody, sendJson } = require("../../_lib/http");
const { createGroupChat } = require("../../_lib/chat");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const result = await withTransaction(async (connection) => {
      const session = await requireSession(req, connection);
      return createGroupChat(session.user, body?.name, body?.memberIds, connection);
    });

    sendJson(res, 200, { mode: "railway-api", ...result.chatState, groupId: result.groupId });
  } catch (error) {
    handleApiError(res, error);
  }
};
