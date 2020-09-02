import { FullAnswer, TopResult } from '../../scripts/types/summary';
import { Database } from 'sqlite3';
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
      AND a.username = s.username
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
      t1.question AS question,
      t1.expression AS expression,
      t1.correctAnswer AS correctAnswer,
      t1.answer AS answer,
      t1.time AS time,
      t2.averge AS averge
    FROM (
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
      AND a.username = s.username
      WHERE a.username = ?
      AND q.quiz = ?
    ) t1
    JOIN (
      SELECT
        t.id AS id,
        AVG(t.time) AS averge
      FROM (SELECT
          q.id AS id,
          CASE
            WHEN q.answer != a.answer THEN NULL
            ELSE ( strftime('%s', s.end)
                  - strftime('%s', s.start)
                  ) * 1000 * a.time
          END AS time
        FROM answer a
        JOIN question q
        ON a.question = q.id
        JOIN quiz_submit s
        ON q.quiz = s.quiz
        AND a.username = s.username
        WHERE q.quiz = ?
      ) t
      GROUP BY t.id
    ) t2
    ON t1.question = t2.id
    `, [username, id, id])
    .finally(() => db.close());
}