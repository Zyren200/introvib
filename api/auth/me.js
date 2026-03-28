const { ensureMethod, handleApiError, sendJson } = require("../_lib/http");
const { requireSession } = require("../_lib/auth");
const { listUsers } = require("../_lib/users");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
  }

  try {
    const session = await requireSession(req);
    const users = await listUsers();

    sendJson(res, 200, {
      mode: "railway-api",
      user: session.user,
      users,
    });
  } catch (error) {
    handleApiError(res, error);
  }
};
