import { Router } from 'express';

const quizRouter = Router();

quizRouter.get('/:quizId', (req, res) => {
  res.render('quiz', {
    quizId: parseInt(req.params.quizId, 10),
  });
});

export default quizRouter;