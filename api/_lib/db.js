const mysql = require("mysql2/promise");

let pool;

const createConfigError = (message) => {
  const error = new Error(message);
  error.statusCode = 503;
  error.code = "DB_CONFIG_ERROR";
  return error;
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildConnectionConfig = () => {
  const connectionUri =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQL_PRIVATE_URL ||
    process.env.RAILWAY_MYSQL_URL ||
    "";

  if (connectionUri) {
    return connectionUri;
  }

  const host = process.env.MYSQLHOST || process.env.RAILWAY_MYSQL_HOST || process.env.DB_HOST;
  const port = parseNumber(
    process.env.MYSQLPORT || process.env.RAILWAY_MYSQL_PORT || process.env.DB_PORT,
    3306
  );
  const user = process.env.MYSQLUSER || process.env.RAILWAY_MYSQL_USER || process.env.DB_USER;
  const password =
    process.env.MYSQLPASSWORD || process.env.RAILWAY_MYSQL_PASSWORD || process.env.DB_PASSWORD || "";
  const database =
    process.env.MYSQLDATABASE || process.env.RAILWAY_MYSQL_DATABASE || process.env.DB_NAME;

  if (!host || !user || !database) {
    throw createConfigError(
      "Railway MySQL environment variables are missing. Add DATABASE_URL or MYSQLHOST/MYSQLUSER/MYSQLDATABASE before using API auth."
    );
  }

  return {
    host,
    port,
    user,
    password,
    database,
    ssl:
      process.env.MYSQL_SSL === "true" || process.env.RAILWAY_MYSQL_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  };
};

const getPool = () => {
  if (!pool) {
    const connectionConfig = buildConnectionConfig();

    if (typeof connectionConfig === "string") {
      pool = mysql.createPool(connectionConfig);
    } else {
      pool = mysql.createPool({
        ...connectionConfig,
        waitForConnections: true,
        connectionLimit: parseNumber(process.env.MYSQL_CONNECTION_LIMIT, 10),
        queueLimit: 0,
      });
    }
  }

  return pool;
};

const query = async (sql, params = []) => {
  const [rows] = await getPool().execute(sql, params);
  return rows;
};

const withTransaction = async (callback) => {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getPool,
  query,
  withTransaction,
};
