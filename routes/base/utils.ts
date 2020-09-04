import { Database } from 'sqlite3';

export async function get<T>(db: Database, sql: string, params?: any): Promise<T | undefined> {
  return await new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(row);
      }
    })
  });
}

export async function all<T>(db: Database, sql: string, params?: any): Promise<T[]> {
  return await new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    })
  });
}

export async function run(db: Database, sql: string, params?: any): Promise<boolean> {
  return await new Promise((resolve, reject) => {
    db.run(sql, params, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    })
  })
}