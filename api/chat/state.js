const { ensureMethod, handleApiError, sendJson } = require("../_lib/http");
const { requireSession } = require("../_lib/auth");
const { getChatStateForUser } = require("../_lib/chat");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
  }

  try {
    const session = await requireSession(req);
    const chatState = await getChatStateForUser(session.user.id);
    sendJson(res, 200, { mode: "railway-api", ...chatState });
  } catch (error) {
    handleApiError(res, error);
  }
};
