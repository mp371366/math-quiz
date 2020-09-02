import { Router } from 'express';
import { getSummary, getTop } from '../base/summary.js';

const summaryApiRouter = Router();

summaryApiRouter.get('/:quizId', async (req, res) => {
  const username = res.locals.username;
  const quizId = parseInt(req.params.quizId, 10);

  res.json(
    await getSummary(quizId, username)
      .catch(((error) => error))
  );
});

summaryApiRouter.get('/top/:quizId', async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  res.json(
    await getTop(quizId)
      .catch(((error) => error))
  );
});

export default summaryApiRouter;