import { Database } from 'sqlite3';
import { all, run } from './utils.js';

export async function login(username: string, password: string) {
  const db = new Database('base.db');

  return all<{ username: string }>(db, `
      SELECT
        username
      FROM
        account
      WHERE
        username = ?
      AND
        password = ?
  `, [username, password])
    .then((rows) => rows.length === 1)
    .finally(() => db.close());
}

export async function changePassword(username: string, newPassword: string) {
  const db = new Database('base.db');

  return run(db, `
      UPDATE
        account
      SET
        password = ?
      WHERE
        username = ?
    `, [newPassword, username])
    .finally(() => db.close());
}