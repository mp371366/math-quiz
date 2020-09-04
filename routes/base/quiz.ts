import { AnswerInfo } from './../../scripts/types/answer';
import { QuestionInfo } from './../../scripts/types/question.js';
import { Database } from 'sqlite3';
import { QuizBasicInfo, QuizInfo } from '../../scripts/types/quiz.js';
import { get, all, run } from './utils.js';
import { arraysEqualAsSets } from '../../scripts/utils.js';

export async function getFinishedQuizes(username: string) {
  const db = new Database('base.db');

  return all<QuizBasicInfo>(db, `
    SELECT
      quiz.id,
      quiz.name
    FROM
      quiz
    LEFT JOIN
      quiz_submit
    ON
      quiz.id = quiz_submit.quiz
    WHERE
      quiz_submit.username = ?
    AND
      quiz_submit.end IS NOT NULL
  `, [username])
    .finally(() => db.close());
}

export async function getNotStartedQuizes(username: string) {
  const db = new Database('base.db');

  return all<QuizBasicInfo>(db, `
    SELECT
      id,
      name
    FROM
      quiz
    WHERE
      id NOT IN (
        SELECT quiz
        FROM quiz_submit
        WHERE username = ?
      )
  `, [username])
    .finally(() => db.close());
}

export async function getStartedQuiz(username: string) {
  const db = new Database('base.db');

  return get<QuizInfo>(db, `
      SELECT
        quiz.id,
        quiz.name,
        quiz.intro
      FROM
        quiz
      JOIN
        quiz_submit
      ON
        quiz.id = quiz_submit.quiz
      WHERE
        quiz_submit.username = ?
      AND
        quiz_submit.end IS NULL
    `, [username])
    .then(async (quiz) => {
      if (quiz === undefined) {
        throw new Error(`No quiz has been started.`);
      }

      const questions =
        await all<QuestionInfo>(db, `
          SELECT
            id,
            quiz,
            expression,
            penalty
          FROM
            question
          WHERE
            quiz = ?
        `, [quiz.id])
          .catch((error) => {
            throw error;
          });

      return {
        questions,
        ...quiz,
      };
    })
    .finally(() => db.close());
}

export async function startQuiz(id: number, username: string) {
  const db = new Database('base.db');

  return get(db, `
      SELECT
        1
      FROM
        quiz_submit
      WHERE
        username = ?
      AND
        quiz = ?
    `, [username, id])
    .then((row) => {
      if (row !== undefined) {
        throw new Error('Quiz already started/finished.');
      }
    })
    .then(() => run(db, `
      INSERT INTO
        quiz_submit(
          username,
          quiz,
          start,
          end
        )
      VALUES (
        ?,
        ?,
        datetime('now'),
        NULL
      )
    `, [username, id]))
    .then(() => getStartedQuiz(username))
    .finally(() => db.close());
}

export async function finishQuiz(username: string, answers: AnswerInfo[]) {
  const db = new Database('base.db');
  const answersIds = answers.map(({ id }) => id);

  return all<{ id: number }>(db, `
      SELECT
        question AS id
      FROM
        answer
      WHERE
        username = ?
    `, [username])
    .then((questtions) => {
      if (questtions.some(({ id }) => answersIds.includes(id))) {
        throw new Error(`Question already submitted.`);
      }
    })
    .then(() => get<{ quiz: number }>(db, `
      SELECT
        quiz
      FROM
        quiz_submit
      WHERE
        username = ?
      AND
        end IS NULL
    `, [username]))
    .then((quiSubmit) => {
      if (quiSubmit === undefined) {
        throw new Error('There is no quiz to submit.');
      }

      return quiSubmit.quiz;
    })
    .then((quizId) => all<{ id: number }>(db, `
        SELECT
          id,
          answer,
          penalty
        FROM
          question
        WHERE
          quiz = ?
      `, [quizId]))
    .then((questions) => {
      if (!arraysEqualAsSets(questions.map(({ id }) => id), answersIds)) {
        throw new Error(`Not all answers matches same quiz/Not all answers from quiz were submited.`);
      }
    })
    .then(async () => await run(db, `BEGIN`)
      .then(() => run(db, `
        UPDATE
          quiz_submit
        SET
          end = datetime('now')
        WHERE
          end IS NULL
        AND
          username = ?
      `, [username])
      ).then(() => answers.forEach(({ id, answer, time }) => run(db, `
        INSERT INTO
          answer(
            question,
            username,
            answer,
            time
          )
        VALUES (
          ?,
          ?,
          ?,
          ?
        )
      `, [id, username, answer, time])))
      .then(() => run(db, `COMMIT`))
      .catch((error) => {
        run(db, `ROLLBACK`);
        throw error;
      }))
    .finally(() => db.close());
}