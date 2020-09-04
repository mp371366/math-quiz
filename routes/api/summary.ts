import { Router } from 'express';
import { getSummary, getTop } from '../base/summary.js';
import { wrapResponse } from '../../scripts/api.js';

const summaryApiRouter = Router();

summaryApiRouter.get('/:quizId', async (req, res) => {
  const username = res.locals.username;
  const quizId = parseInt(req.params.quizId, 10);
  const result = getSummary(quizId, username);
  const response = await wrapResponse(result);
  res.json(response);
});

summaryApiRouter.get('/top/:quizId', async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const result = getTop(quizId);
  const response = await wrapResponse(result);
  res.json(response);
});

export default summaryApiRouter;