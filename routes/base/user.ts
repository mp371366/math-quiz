import * as sqlite3 from 'sqlite3';

export async function login(username: string, password: string): Promise<boolean> {
  const db = new sqlite3.Database('base.db');
  return await new Promise((resolve, reject) => {
    db.all(`
      SELECT 1
      FROM account
      WHERE username = ? AND password = ?
    `, [username, password], (error, rows) => {
      db.close();

      if (error) {
        reject(error);
      } else {
        resolve(rows.length === 1);
      }
    });
  });
}

export async function changePassword(username: string, newPassword: string): Promise<boolean> {
  sqlite3.verbose();
  const db = new sqlite3.Database('base.db');
  return await new Promise((resolve, reject) => {
    db.run(`
      UPDATE account
      SET password = ?
      WHERE username = ?
    `, [newPassword, username], (error) => {
      db.close();

      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}