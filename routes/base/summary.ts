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
        answer.username,
        (
          strftime('%s', quiz_submit.end)
        - strftime('%s', quiz_submit.start)
        + (CASE
            WHEN question.answer = answer.answer THEN 0
            ELSE question.penalty
          END)
        ) * 1000 * answer.time AS time
      FROM
        answer
      JOIN
        question
      ON
        answer.question = question.id
      JOIN
        quiz_submit
      ON
        question.quiz = quiz_submit.quiz
      AND
        answer.username = quiz_submit.username
      WHERE
        question.quiz = ?
    )
    GROUP BY
      username
    ORDER BY
      time ASC
    LIMIT ?
  `, [id, limit])
    .finally(() => db.close());
}

export async function getSummary(id: number, username: string) {
  const db = new Database('base.db');

  return await all<FullAnswer>(db, `
    SELECT
      question,
      expression,
      correctAnswer,
      answer,
      time,
      averge
    FROM (
      SELECT
        question.id AS question,
        question.answer AS correctAnswer,
        expression,
        answer.answer AS answer,
        (
          strftime('%s', quiz_submit.end)
        - strftime('%s', quiz_submit.start)
        + (CASE
            WHEN question.answer = answer.answer THEN 0
            ELSE question.penalty
          END)
        ) * 1000 * answer.time AS time
      FROM
        answer
      JOIN
        question
      ON
        answer.question = question.id
      JOIN
        quiz_submit
      ON
        question.quiz = quiz_submit.quiz
      AND
        answer.username = quiz_submit.username
      WHERE
        answer.username = ?
      AND
        question.quiz = ?
    )
    JOIN (
      SELECT
        id,
        AVG(time) AS averge
      FROM (SELECT
          question.id,
          CASE
            WHEN question.answer != answer.answer THEN NULL
            ELSE ( strftime('%s', quiz_submit.end)
                 - strftime('%s', quiz_submit.start)
                 ) * 1000 * answer.time
          END AS time
        FROM
          answer
        JOIN
          question
        ON
          answer.question = question.id
        JOIN
          quiz_submit
        ON
          question.quiz = quiz_submit.quiz
        AND
          answer.username = quiz_submit.username
        WHERE
          question.quiz = ?
      )
      GROUP BY
        id
    )
    ON
      question = id
    `, [username, id, id])
    .finally(() => db.close());
}