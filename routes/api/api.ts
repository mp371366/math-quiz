import { Router } from 'express';
import quizRouter from './quiz';
import summaryRouter from './summary';

const apiRouter = Router();

apiRouter.use('/quiz', quizRouter);
apiRouter.use('/summary', summaryRouter);

export default apiRouter;