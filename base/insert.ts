import { Database } from 'sqlite3';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';

config();

const salt = process.env.SALT ?? '$2b$10$JFDmxYUkJh3AwALlyTTefe';
const hash = async (password: string) => bcrypt.hash(password, salt);
const db = new Database('base.db');

db.serialize(async () => {
  await (async () => db.run(`
    INSERT INTO account(username, password)
    VALUES
      ('user1', ?),
      ('user2', ?)
  `, [await hash('user1'), await hash('user2')]))();
  db.run(`
    INSERT INTO quiz(id, name, intro)
    VALUES
      (1, 'Easy', 'Good luck!'),
      (2, 'Hard', 'Be quick!')
  `).run(`
  INSERT INTO question(id, quiz, expression, answer, penalty)
  VALUES
    (1, 1, '2 + 2', 4, 1),
    (2, 1, '2 - 2', 0, 2),
    (3, 2, '2 * 2', 4, 3),
    (4, 2, '2 / 2', 1, 4)
`).close();
});