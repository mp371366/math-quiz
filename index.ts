import * as express from 'express';
import * as csrf from 'csurf';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

const app = express();
const port = 3000;

app.locals.basedir = __dirname;
app.use('/scripts', express.static('scripts'));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(session({
  secret: 'math-quiz',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 15 * 60 * 1000,
  },
}));

app.get('/', (request, response) => {
  response.render('index', {});
});

app.get('/question', (request, response) => {
  response.render('question', {});
});

app.get('/summary', (request, response) => {
  response.render('summary', {});
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server listening on http://localhost:${port}`);
});