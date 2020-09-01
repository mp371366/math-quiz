import * as sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import { Quiz, Question, Answer } from '../types';
import { get, all, run } from './utils.js';
import { arraysEqualAsSets } from '../utils.js';

export async function getFinishedQuizes(username: string) {
  const db = new Database('base.db');
  return all<Pick<Quiz, 'id' | 'name'>>(db, `
    SELECT q.id, q.name
    FROM quiz q
    LEFT JOIN quiz_submit s
    ON q.id = s.quiz
    WHERE s.username = ?
    AND s.end IS NOT NULL
  `, [username])
    .finally(() => db.close());
}

export async function getNotStartedQuizes(username: string) {
  const db = new Database('base.db');
  return all<Pick<Quiz, 'id' | 'name'>>(db, `
    SELECT q.id, q.name
    FROM quiz q
    WHERE q.id NOT IN (
      SELECT quiz
      FROM quiz_submit
      WHERE username = ?
    )
  `, [username])
    .finally(() => db.close());
}

export async function getQuiz(id: number, username: string) {
  const db = new Database('base.db');
  return await Promise.resolve()
    .then(async () => {
      await run(db, `BEGIN`)
        .then(() => run(db, `
          INSERT INTO quiz_submit(username, quiz, start, end)
          VALUES (?, ?, datetime('now'), NULL)
        `, [username, id])
        )
        .then(() => run(db, `COMMIT`))
        .catch((error) => {
          run(db, `ROLLBACK`);
          throw error;
        });
    })
    .then(() => get<Omit<Quiz, 'questions'>>(db, `
      SELECT id, name, intro
      FROM quiz
      WHERE id = ?
    `, [id]))
    .then(async (quiz) => {
      const questions = await all<Omit<Question, 'answer'>>(db, `
      SELECT id, quiz, expression, penalty
      FROM question
      WHERE quiz = ?
    `, [quiz.id]);

      return {
        questions,
        ...quiz,
      };
    })
    .finally(() => db.close());
}

export async function finishQuiz(id: number, username: string, answers: Pick<Answer, 'id' | 'time' | 'answer'>[]) {
  const db = new Database('base.db');
  const answersIds = answers.map(({ id }) => id);
  sqlite3.verbose();

  return await all<{ id: number }>(db, `
        SELECT question AS id
        FROM answer
        WHERE username = ?
      `, [username])
    .then((questtions) => {
      if (questtions.some(({ id }) => answersIds.includes(id))) {
        throw new Error(`Qestion.id=${id} already submitted.`);
      }
    })
    .then(() => all<Pick<Question, 'id' | 'answer' | 'penalty'>>(db, `
        SELECT id, answer, penalty
        FROM question
        WHERE quiz = ?
      `, [id]))
    .then((questions) => {
      if (!arraysEqualAsSets(questions.map(({ id }) => id), answersIds)) {
        throw new Error(`Not all answers matches same quiz/Not all answers from quiz were submited for quiz.id = ${id}.`);
      }
    })
    .then(async () => {
      await run(db, `BEGIN`)
        .then(() => run(db, `
          UPDATE quiz_submit
          SET end = datetime('now')
          WHERE quiz = ?
          AND username = ?
        `, [id, username])
        ).then(() => answers.forEach(({ id, answer, time }) => run(db, `
          INSERT INTO answer(question, username, answer, time)
          VALUES (?, ?, ?, ?)
        `, [id, username, answer, time])))
        .then(() => run(db, `COMMIT`))
        .catch((error) => {
          run(db, `ROLLBACK`);
          throw error;
        });
    })
    .finally(() => db.close())
    ;
}