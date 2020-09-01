import * as sqlite3 from 'sqlite3';

sqlite3.verbose();

const db = new sqlite3.Database('base.db');

db.run(`
  CREATE TABLE account(
    username VARCHAR(255) NOT NULL CONSTRAINT pk_account PRIMARY KEY,
    password VARCHAR(255) NOT NULL
  )
`);

db.run(`
  CREATE TABLE quiz(
    id INTEGER NOT NULL CONSTRAINT pk_quiz PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    intro VARCHAR(255) NOT NULL
  )
`);

db.run(`
  CREATE TABLE question(
    id INTEGER NOT NULL CONSTRAINT pk_question PRIMARY KEY,
    quiz INTEGER NOT NULL,
    expression VARCHAR(255) NOT NULL,
    answer REAL NOT NULL,
    penalty INTEGER NOT NULL,
    FOREIGN KEY (quiz) REFERENCES quiz(id)
  )
`);

db.run(`CREATE TABLE quiz_submit(
    username VARCHAR(255) NOT NULL,
    quiz INTEGER NOT NULL,
    start INTEGER NOT NULL,
    end INTEGER NULL,
    FOREIGN KEY (username) REFERENCES account(username),
    FOREIGN KEY (quiz) REFERENCES quiz(id)
  )
`);

db.run(`
  CREATE TABLE answer(
    question INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    answer REAL NOT NULL,
    time REAL NOT NULL,
    FOREIGN KEY (username) REFERENCES account(username),
    FOREIGN KEY (question) REFERENCES question(id)
  )
`);

db.close();