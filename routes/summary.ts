import { Router } from 'express';
import { getFinishedQuizes } from './base/quiz.js';

const summaryRouter = Router();

summaryRouter.get('/', async (req, res) => {
  const quizes = await getFinishedQuizes(res.locals.username);

  res.render('summary', {
    quizes,
  });
});

summaryRouter.get('/:quizId', async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const quizes = await getFinishedQuizes(res.locals.username);

  res.render('summary', {
    quizId,
    quizes,
  });
});

export default summaryRouter;