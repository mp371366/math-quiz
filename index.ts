import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { login, changePassword, getQuiz, finishQuiz } from './scripts/base/index.js';
import { getFinishedQuizes, getNotStartedQuizes } from './scripts/base/index.js';
import dotenv from 'dotenv';
import { sum } from './scripts/utils.js';
import { good, bad } from './scripts/api/index.js';
import { getSummary, getTop } from './scripts/base/summary.js';
import bcrypt from 'bcrypt';
import connectSqlite3 from 'connect-sqlite3';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;
const secret = process.env.SECRET ?? 'math-quiz';
const salt = process.env.SALT ?? '$2b$10$JFDmxYUkJh3AwALlyTTefe';
const hash = async (password: string) => bcrypt.hash(password, salt);

app.locals.basedir = `${process.cwd()}`;
app.use(express.static('public', { index: 'index.js' }));
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

const notAuthPaths = ['/', '/login'];

app.use((request, response, next) => {
  if (notAuthPaths.includes(request.path) || request.session?.username !== undefined) {
    next();
  } else {
    response.render('login', {
      error: 'Login required.',
      csrfToken: request.csrfToken(),
      next: request.path,
    });
  }
});

app.get('/', (request, response) => {
  const username = request.session?.username as string;

  response.render('index', {
    username,
    csrfToken: request.csrfToken(),
  });
});

app.get('/quiz/:quizId', (request, response) => {
  const username = request.session?.username as string;

  response.render('quiz', {
    username,
    csrfToken: request.csrfToken(),
    quizId: parseInt(request.params.quizId, 10),
  });
});

app.get('/summary', async (request, response) => {
  const username = request.session?.username as string;
  const quizes = await getFinishedQuizes(username);

  response.render('summary', {
    username,
    csrfToken: request.csrfToken(),
    quizes,
  });
});

app.get('/summary/:quizId', async (request, response) => {
  const username = request.session?.username as string;
  const quizId = parseInt(request.params.quizId, 10);
  const quizes = await getFinishedQuizes(username);

  response.render('summary', {
    username,
    csrfToken: request.csrfToken(),
    quizId,
    quizes,
  });
});

app.get('/login', (request, response) => {
  const username = request.session?.username as string;

  response.render('login', {
    username,
    csrfToken: request.csrfToken(),
    next: '/',
  });
});

app.post('/login', async (request, response) => {
  const username = request.body.username;
  const password = await hash(request.body.password);
  const next = request.body.next;
  const result = await login(username, password);

  if (result && request.session) {
    request.session.username = username;
    response.redirect(next);
  } else {
    response.render('login', {
      error: 'Bad login.',
      csrfToken: request.csrfToken(),
      next,
    })
  }
});

app.get('/change-password', (request, response) => {
  const username = request.session?.username as string;

  response.render('change-password', {
    username,
    csrfToken: request.csrfToken(),
  });
});

app.post('/change-password', async (request, response) => {
  if (request.session?.username === undefined) {
    return;
  }

  const username = request.session?.username as string;
  const newPassword = request.body['new-password'];
  const repeatPassword = request.body['password-repeat'];

  if (newPassword !== repeatPassword
    || !await changePassword(username, await hash(newPassword))) {
    response.render('change-password', {
      error: 'Passwords do not match each other.',
      csrfToken: request.csrfToken(),
    });
  } else {
    // tslint:disable-next-line:no-console
    request.session?.destroy(console.log);
    response.redirect('/');
  }
});

app.post('/logout', (request, response) => {
  if (request.session) {
    request.session.username = undefined;
  }

  response.redirect('/');
});

app.get('/api/quiz', async (request, response) => {
  if (request.session?.username === undefined) {
    response.json(bad('Login required'));

    return;
  }

  const username = request.session?.username as string;

  response.json(
    await getNotStartedQuizes(username)
      .catch(((error: any) => error))
  );
});

app.get('/api/quiz/:quizId', async (request, response) => {
  if (request.session?.username === undefined) {
    response.json(bad('Login required'));

    return;
  }

  const username = request.session?.username as string;
  const quizId = parseInt(request.params.quizId, 10);
  response.json(
    await getQuiz(quizId, username)
      .catch(((error) => error))
  );
});

app.post('/api/quiz/:quizId', async (request, response) => {
  if (request.session?.username === undefined) {
    response.json(bad('Login required'));

    return;
  }

  const username = request.session?.username as string;
  const quizId = parseInt(request.params.quizId, 10);
  const answers: Parameters<typeof finishQuiz>[2] = request.body;
  const sumOfTime = sum(...answers.map(({ time }) => time));
  const EPS = 10e-3;

  if (Math.abs(sumOfTime - 1) > EPS) {
    response.json(bad('The percentages do not add up to 100'));
  } else {
    finishQuiz(quizId, username, answers)
      .then(() => response.json(good()))
      .catch((error) => response.json(bad(error.toString())));
  }
});

app.get('/api/summary/:quizId', async (request, response) => {
  if (request.session?.username === undefined) {
    response.json(bad('Login required'));

    return;
  }

  const username = request.session?.username as string;
  const quizId = parseInt(request.params.quizId, 10);

  response.json(
    await getSummary(quizId, username)
      .catch(((error) => error))
  );
});

app.get('/api/summary/top/:quizId', async (request, response) => {
  const quizId = parseInt(request.params.quizId, 10);
  response.json(
    await getTop(quizId)
      .catch(((error) => error))
  );
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server listening on http://localhost:${port}`);
});