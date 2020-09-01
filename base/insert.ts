import * as sqlite3 from 'sqlite3';

sqlite3.verbose();

const db = new sqlite3.Database('base.db');

db.run(`
  INSERT INTO account(username, password)
  VALUES
    ('user1', 'user1'),
    ('user2', 'user2'),
    ('a', 'a')
`);

db.run(`
  INSERT INTO quiz(id, name, intro)
  VALUES
    (1, 'Easy', 'Good luck!'),
    (2, 'Hard', 'Be quick!')
`);

db.run(`
  INSERT INTO question(id, quiz, expression, answer, penalty)
  VALUES
    (1, 1, '2 + 2', 4, 1),
    (2, 1, '2 - 2', 0, 2),
    (3, 2, '2 * 2', 4, 3),
    (4, 2, '2 / 2', 1, 4)
`);

db.close();