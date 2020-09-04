import { idSelector, rethrow, tryExec, makeErrorInfo } from './dom.js';
import { QUIZ_URL } from './settings.js';
import { getData } from './api.js';
import { QuizBasicInfo } from './types/quiz.js';

const quizesElement = idSelector('quizes');

tryExec(async () => {
  if (quizesElement) {
    quizesElement.innerText = 'Please wait ...';
    const quizes = await getData<QuizBasicInfo[]>(QUIZ_URL)
      .catch(rethrow);
    quizesElement.innerText = '';
    quizesElement.append(...quizes.map(({ id, name }) => {
      const buttonElemet = document.createElement('div');
      buttonElemet.classList.add('button');
      buttonElemet.innerText = name;

      const anchorElement = document.createElement('a');
      anchorElement.href = `/quiz/${id}`;
      anchorElement.appendChild(buttonElemet);

      const quizElement = document.createElement('li');
      quizElement.appendChild(anchorElement);
      return quizElement;
    }));
  }
}).catch(makeErrorInfo);