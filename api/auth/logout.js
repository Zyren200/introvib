const { ensureMethod, handleApiError, sendJson } = require("../_lib/http");
const { revokeSessionToken } = require("../_lib/auth");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    const authorizationHeader = req.headers.authorization || req.headers.Authorization || "";
    const sessionToken = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.slice(7).trim()
      : req.headers["x-session-token"] || null;

    await revokeSessionToken(sessionToken);

    sendJson(res, 200, {
      success: true,
      mode: "railway-api",
    });
  } catch (error) {
    handleApiError(res, error);
  }
};
