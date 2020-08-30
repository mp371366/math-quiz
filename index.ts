import * as express from 'express';
import * as csrf from 'csurf';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { login, changePassword } from './base/login';
import { config } from 'dotenv';

config();

const app = express();
const port = process.env.PORT ?? 3000;
const secret = process.env.SECRET ?? 'math-quiz';

app.locals.basedir = __dirname;
app.use('/scripts', express.static('build'));
app.use('/stylesheets', express.static('stylesheets'));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secret));
app.use(csrf({ cookie: true }));
app.use(session({
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 15 * 60 * 1000,
    sameSite: 'strict'
  },
}));

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
  const username = request.session?.username;

  response.render('index', {
    username,
    csrfToken: request.csrfToken(),
  });
});

app.get('/quiz', (request, response) => {
  const username = request.session?.username;

  response.render('quiz', {
    username,
    csrfToken: request.csrfToken(),
  });
});

app.get('/summary', (request, response) => {
  const username = request.session?.username;

  response.render('summary', {
    username,
    csrfToken: request.csrfToken(),
  });
});

app.get('/login', (request, response) => {
  const username = request.session?.username;

  response.render('login', {
    username,
    csrfToken: request.csrfToken(),
    next: '/',
  });
});

app.post('/login', async (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
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
  const username = request.session?.username;

  response.render('change-password', {
    username,
    csrfToken: request.csrfToken(),
  });
});

app.post('/change-password', async (request, response) => {
  if (request.session?.username === undefined) {
    return;
  }

  const username = request.session?.username;
  const newPassword = request.body['new-password'];
  const repeatPassword = request.body['password-repeat'];

  if (newPassword !== repeatPassword || !await changePassword(username, newPassword)) {
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

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server listening on http://localhost:${port}`);
});