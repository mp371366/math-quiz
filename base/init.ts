import * as sqlite3 from 'sqlite3';

sqlite3.verbose();

const db = new sqlite3.Database('base.db');

db.run(`
  CREATE TABLE account(
    username VARCHAR(255),
    password VARCHAR(255)
  )
`);

db.close();