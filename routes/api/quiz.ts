import { Router } from 'express';
import { getQuiz, finishQuiz, getNotStartedQuizes } from '../base/quiz.js';
import { sum } from '../../scripts/utils.js';
import { good, bad } from '../../scripts/api/utils.js';
import Answer from '../../scripts/types/answer.js';

const quizApiRouter = Router();

quizApiRouter.get('/', async (req, res) => {
  const username = res.locals.username;

  res.json(
    await getNotStartedQuizes(username)
      .catch(((error) => error))
  );
});

quizApiRouter.get('/:quizId', async (req, res) => {
  const username = res.locals.username;
  const quizId = parseInt(req.params.quizId, 10);

  res.json(
    await getQuiz(quizId, username)
      .catch(((error) => error))
  );
});

quizApiRouter.post('/:quizId', async (req, res) => {
  const username = res.locals.username;
  const quizId = parseInt(req.params.quizId, 10);
  const answers: Pick<Answer, 'id' | 'time' | 'answer'>[] = req.body;
  const sumOfTime = sum(...answers.map(({ time }) => time));
  const EPS = 10e-3;

  if (Math.abs(sumOfTime - 1) > EPS) {
    res.json(bad('The percentages do not add up to 100'));
  } else {
    finishQuiz(quizId, username, answers)
      .then(() => res.json(good()))
      .catch((error) => res.json(bad(error.toString())));
  }
});

export default quizApiRouter;