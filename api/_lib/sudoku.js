const { query } = require("./db");
const { runQuery } = require("./users");

const STARTING_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const cloneBoard = (board) => board.map((row) => [...row]);

const parseBoardState = (value) => {
  if (!value) return cloneBoard(STARTING_PUZZLE);

  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(parsed) || parsed.length !== 9) {
    return cloneBoard(STARTING_PUZZLE);
  }

  return parsed.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== 9) {
      return [...STARTING_PUZZLE[rowIndex]];
    }

    return row.map((cell, columnIndex) => {
      const nextValue = Number(cell);
      if (!Number.isInteger(nextValue) || nextValue < 0 || nextValue > 9) {
        return STARTING_PUZZLE[rowIndex][columnIndex];
      }

      return nextValue;
    });
  });
};

const boardsMatch = (firstBoard, secondBoard) =>
  firstBoard.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === secondBoard[rowIndex][columnIndex])
  );

const countMoves = (boardState) =>
  boardState.reduce(
    (total, row, rowIndex) =>
      total +
      row.filter((value, columnIndex) => STARTING_PUZZLE[rowIndex][columnIndex] === 0 && value > 0)
        .length,
    0
  );

const getSudokuProgressForUser = async (userId, executor = query) => {
  const rows = await runQuery(
    executor,
    `SELECT status, board_state, moves_count, started_at, completed_at
     FROM sudoku_progress
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    return {
      status: "not_started",
      boardState: cloneBoard(STARTING_PUZZLE),
      movesCount: 0,
      startedAt: null,
      completedAt: null,
    };
  }

  return {
    status: rows[0].status || "not_started",
    boardState: parseBoardState(rows[0].board_state),
    movesCount: Number(rows[0].moves_count) || 0,
    startedAt: rows[0].started_at ? new Date(rows[0].started_at).getTime() : null,
    completedAt: rows[0].completed_at ? new Date(rows[0].completed_at).getTime() : null,
  };
};

const saveSudokuProgressForUser = async (userId, boardState, executor = query) => {
  const normalizedBoard = parseBoardState(boardState);
  const movesCount = countMoves(normalizedBoard);
  const hasStarted = !boardsMatch(normalizedBoard, STARTING_PUZZLE);
  const nextStatus = hasStarted ? "in_progress" : "not_started";

  await runQuery(
    executor,
    `INSERT INTO sudoku_progress (
       user_id,
       status,
       board_state,
       moves_count,
       started_at,
       completed_at
     )
     VALUES (?, ?, ?, ?, CASE WHEN ? = 'in_progress' THEN UTC_TIMESTAMP() ELSE NULL END, NULL)
     ON DUPLICATE KEY UPDATE
       status = IF(status = 'completed', status, VALUES(status)),
       board_state = IF(status = 'completed', board_state, VALUES(board_state)),
       moves_count = IF(status = 'completed', moves_count, VALUES(moves_count)),
       started_at = IF(started_at IS NULL AND VALUES(status) = 'in_progress', UTC_TIMESTAMP(), started_at),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, nextStatus, JSON.stringify(normalizedBoard), movesCount, nextStatus]
  );

  return getSudokuProgressForUser(userId, executor);
};

module.exports = {
  STARTING_PUZZLE,
  getSudokuProgressForUser,
  parseBoardState,
  saveSudokuProgressForUser,
};
