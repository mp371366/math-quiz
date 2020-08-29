import * as sqlite3 from 'sqlite3';

sqlite3.verbose();

const db = new sqlite3.Database('base.db');

db.run(`
  INSERT INTO account(username, password)
  VALUES
    ('user1', 'user1'),
    ('user2', 'user2')
`);

db.close();