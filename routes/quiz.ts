import { Router } from 'express';

const quizRouter = Router();

quizRouter.get('/:quizId', (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  res.render('quiz', {
    quizId
  });
});

export default quizRouter;