import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectSqlite3 from 'connect-sqlite3';
import indexRouter from './routes/index';
import userRouter from './routes/user';
import quizRouter from './routes/quiz';
import summaryRouter from './routes/summary';
import apiRouter from './routes/api/api';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;
const secret = process.env.SECRET ?? 'math-quiz';
const salt = process.env.SALT ?? '$2b$10$JFDmxYUkJh3AwALlyTTefe';
const hash = async (password: string) => bcrypt.hash(password, salt);

app.locals.hash = hash;
app.locals.basedir = `${process.cwd()}`;

app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secret));
app.use(csrf({ cookie: true }));
app.use(session({
  store: new connectSqlite3(session)({
    table: 'session',
    db: 'base.db',
  }),
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 15 * 60 * 1000,
    sameSite: 'strict'
  },
}));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.username = req.session?.username;
  res.locals.csrfToken = req.csrfToken();
  next();
});

const notAuthPaths = ['/', '/user'];

app.use((req, res, next) => {
  if (notAuthPaths.includes(req.path) || req.session?.username !== undefined) {
    next();
  } else {
    res.render('user/login', {
      error: 'Login required.',
      next: req.path,
    });
  }
});

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/quiz', quizRouter);
app.use('/summary', summaryRouter);
app.use('/api', apiRouter);

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server listening on http://localhost:${port}`);
});