import { idSelector } from './utils.js';
import { getAllQuizes } from './api/quiz.js';

const quizesElement = idSelector('quizes');

(async () => {
  if (quizesElement) {
    quizesElement.innerText = 'Please wait ...';
    const quizes = await getAllQuizes();
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