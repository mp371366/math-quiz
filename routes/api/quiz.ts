import { Router } from 'express';
import { startQuiz, finishQuiz, getNotStartedQuizes, getStartedQuiz } from '../base/quiz.js';
import { wrapResponse, bad } from '../../scripts/api.js';
import { isAnswerInfo } from '../../scripts/types/answer.js';
import { isArray } from '../../scripts/types/utils.js';

const quizApiRouter = Router();

quizApiRouter.get('/', async (req, res) => {
  const username = res.locals.username;
  const result = getNotStartedQuizes(username);
  const response = await wrapResponse(result);
  res.json(response);
});

quizApiRouter.get('/start', async (req, res) => {
  const username = res.locals.username;
  const result = getStartedQuiz(username);
  const response = await wrapResponse(result);
  res.json(response);
});

quizApiRouter.post('/start/:quizId', async (req, res) => {
  const username = res.locals.username;
  const quizId = parseInt(req.params.quizId, 10);
  const result = startQuiz(quizId, username);
  const response = await wrapResponse(result);
  res.json(response);
});

quizApiRouter.post('/finish', async (req, res) => {
  const username = res.locals.username;
  const answers = req.body;

  if (!isArray(answers, isAnswerInfo)) {
    res.json(bad<void>(new Error('Invalid type of body.')));
    return;
  }

  const result = finishQuiz(username, answers);
  const response = await wrapResponse(result);
  res.json(response);
});

export default quizApiRouter;