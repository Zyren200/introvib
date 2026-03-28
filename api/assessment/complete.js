const crypto = require("crypto");
const { withTransaction } = require("../_lib/db");
const { requireSession } = require("../_lib/auth");
const { createHttpError, ensureMethod, handleApiError, parseJsonBody, sendJson } = require("../_lib/http");
const { mapAnswerToPersonality, resolvePersonalityFromAnswers } = require("../_lib/personality");
const { getUserById, listUsers, runQuery } = require("../_lib/users");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const rawAnswers = Array.isArray(body?.answers) ? body.answers : [];
    const answers = rawAnswers.map((answer) => (answer || "").toString().trim().toUpperCase());

    if (!answers.length) {
      throw createHttpError("Assessment answers are required.", 400);
    }

    const { user } = await withTransaction(async (connection) => {
      const session = await requireSession(req, connection);
      const questionRows = await runQuery(
        connection,
        `SELECT id, display_order
         FROM personality_questions
         WHERE is_active = 1
         ORDER BY display_order ASC`
      );

      if (answers.length !== questionRows.length) {
        throw createHttpError(`Expected ${questionRows.length} answers for the IntroVibe assessment.`, 400);
      }

      const invalidAnswer = answers.find((answer) => !["A", "B", "C"].includes(answer));
      if (invalidAnswer) {
        throw createHttpError("Each assessment answer must be A, B, or C.", 400);
      }

      const finalPersonality = resolvePersonalityFromAnswers(
        answers,
        session.user.predictedPersonality || "Ambivert"
      );
      const assessmentId = crypto.randomUUID();

      await runQuery(
        connection,
        `INSERT INTO personality_assessments (
           id,
           user_id,
           predicted_personality,
           final_personality,
           total_questions
         )
         VALUES (?, ?, ?, ?, ?)`,
        [
          assessmentId,
          session.user.id,
          session.user.predictedPersonality || null,
          finalPersonality,
          questionRows.length,
        ]
      );

      for (let index = 0; index < questionRows.length; index += 1) {
        await runQuery(
          connection,
          `INSERT INTO personality_assessment_answers (
             assessment_id,
             question_id,
             answer_code,
             mapped_personality
           )
           VALUES (?, ?, ?, ?)`,
          [assessmentId, questionRows[index].id, answers[index], mapAnswerToPersonality(answers[index])]
        );
      }

      await runQuery(
        connection,
        `UPDATE users
         SET personality_type = ?,
             assessment_completed = 1,
             sudoku_completed = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [finalPersonality, finalPersonality === "Introvert" ? 0 : 1, session.user.id]
      );

      await runQuery(
        connection,
        `INSERT INTO sudoku_progress (user_id, status)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status),
           completed_at = NULL,
           updated_at = CURRENT_TIMESTAMP`,
        [session.user.id, finalPersonality === "Introvert" ? "not_started" : "completed"]
      );

      const updatedUser = await getUserById(session.user.id, connection);
      return { user: updatedUser };
    });

    const users = await listUsers();

    sendJson(res, 200, {
      mode: "railway-api",
      user,
      users,
    });
  } catch (error) {
    handleApiError(res, error);
  }
};
