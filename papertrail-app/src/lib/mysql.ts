import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be configured to use mysql2.");
}

export const mysqlPool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 6,
  decimalNumbers: true,
});
