import { Router } from 'express';
import { login, changePassword } from './base/user.js';

const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.render('user/login', {
    next: '/'
  });
});

userRouter.post('/', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const next = req.body.next;
  const passwordHash = await req.app.locals.hash(password);
  const result = await login(username, passwordHash);

  if (result && req.session) {
    req.session.username = username;
    res.redirect(next);
  } else {
    res.render('user/login', {
      error: 'Bad login.',
      next,
    });
  }
});

userRouter.get('/change-password', (req, res) => {
  res.render('user/change-password');
});

userRouter.post('/change-password', async (req, res) => {
  try {
    const newPassword = req.body['new-password'];
    const repeatPassword = req.body['password-repeat'];
    const username = res.locals.username;
    const passwordHash = await req.app.locals.hash(newPassword);

    if (newPassword !== repeatPassword) {
      throw new Error('Passwords do not match each other.');
    } else if (!await changePassword(username, passwordHash)) {
      throw new Error('Unable to change password.');
    } else {
      req.session?.destroy((error) => {
        if (error) {
          throw error;
        }
      });
      res.redirect('/');
    }
  } catch (error) {
    res.render('user/change-password', {
      error: error.message
    });
  }
});

userRouter.post('/logout', (req, res) => {
  if (req.session) {
    req.session.username = undefined;
  }

  res.redirect('/');
});

export default userRouter;