import { idSelector } from './utils.js';
import { QUIZ_URL } from './settings.js';
import { getData } from './api.js';
import Quiz from './types/quiz.js';

const quizesElement = idSelector('quizes');

(async () => {
  if (quizesElement) {
    quizesElement.innerText = 'Please wait ...';
    const quizes = await getData<Pick<Quiz, "id" | "name">[]>(QUIZ_URL);
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
})();