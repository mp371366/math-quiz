import { FullAnswer, TopResult } from './../types/summary';
import * as sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import { all } from './utils.js';

export async function getTop(id: number, limit: number = 5) {
  const db = new Database('base.db');

  return await all<TopResult>(db, `
    SELECT
      username,
      SUM(time) AS time
    FROM (
      SELECT
        a.username AS username,
        (strftime('%s', s.end) - strftime('%s', s.start)
        + (CASE
            WHEN q.answer = a.answer THEN 0
            ELSE q.penalty
          END)
        ) * 1000 * a.time AS time
      FROM answer a
      JOIN question q
      ON a.question = q.id
      JOIN quiz_submit s
      ON q.quiz = s.quiz
      WHERE q.quiz = ?
    )
    GROUP BY username
    ORDER BY time ASC
    LIMIT ?
  `, [id, limit])
    .finally(() => db.close());
}

export async function getSummary(id: number, username: string) {
  const db = new Database('base.db');

  return await all<FullAnswer>(db, `
      SELECT
        q.id AS question,
        q.expression AS expression,
        q.answer AS correctAnswer,
        a.answer AS answer,
        (strftime('%s', s.end) - strftime('%s', s.start)
        + (CASE
            WHEN q.answer = a.answer THEN 0
            ELSE q.penalty
          END)
        ) * 1000 * a.time AS time
      FROM answer a
      JOIN question q
      ON a.question = q.id
      JOIN quiz_submit s
      ON q.quiz = s.quiz
      WHERE a.username = ?
      AND q.quiz = ?
    `, [username, id])
    .finally(() => db.close());
}