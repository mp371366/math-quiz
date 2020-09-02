import { Router } from 'express';
import { login, changePassword } from './base/user.js';

const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.render('login', {
    next: '/'
  });
});

userRouter.post('/', async (req, res) => {
  const username = req.body.username;
  const password = await req.app.locals.hash(req.body.password);
  const next = req.body.next;
  const result = await login(username, password);

  if (result && req.session) {
    req.session.username = username;
    res.redirect(next);
  } else {
    res.render('login', {
      error: 'Bad login.',
      next,
    });
  }
});

userRouter.get('/change-password', (req, res) => {
  res.render('change-password');
});

userRouter.post('/change-password', async (req, res) => {
  const newPassword = req.body['new-password'];
  const repeatPassword = req.body['password-repeat'];
  const username = res.locals.username;

  if (newPassword !== repeatPassword
    || !await changePassword(username, await req.app.locals.hash(newPassword))) {
    res.render('change-password', {
      error: 'Passwords do not match each other.'
    });
  } else {
    // tslint:disable-next-line:no-console
    req.session?.destroy(console.log);
    res.redirect('/');
  }
});

userRouter.post('/logout', (req, res) => {
  if (req.session) {
    req.session.username = undefined;
  }

  // TODO else

  res.redirect('/');
});

export default userRouter;