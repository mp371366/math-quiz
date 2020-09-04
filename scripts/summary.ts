import { FullAnswer, TopResult } from './types/summary.js';
import { idSelector, makeErrorInfo, actionWith, rethrow } from './dom.js';
import { ticksToTime } from './time.js';
import { sum } from './utils.js';
import { SUMMARY_URL } from './settings.js';
import { getData } from './api.js';

let lastQuizId = undefined as number | undefined;
const idElementContent = document?.querySelector('meta[name="quiz-id"]')?.getAttribute('content');
let quizId = idElementContent ? parseInt(idElementContent, 10) : undefined;
let summary: FullAnswer[] | void;
let tops: TopResult[] | void;

function action<T = Event, U = any>(f: (ev: T) => U): (ev: T) => U {
  return actionWith<T, U>(redraw)(f);
}

const create = (as: string) => (innerText: string | number | undefined): HTMLElement => {
  const element = document.createElement(as);
  element.innerText = innerText?.toString() ?? 'N/A';
  return element;
};

const resultsContainer = idSelector('results-container');
const resultsElement = idSelector('results');
const overallElement = idSelector('overall');
const topElement = idSelector('top');

async function redraw() {
  if (lastQuizId === quizId) {
    return;
  }

  if (lastQuizId !== undefined) {
    const oldButton = document.querySelector(`.button[data-id="${lastQuizId}"]`);
    oldButton?.classList.remove('active');
  }

  lastQuizId = quizId;

  if (quizId !== undefined) {
    const newButton = document.querySelector(`.button[data-id="${lastQuizId}"]`);
    newButton?.classList.add('active');

    summary = await getData<FullAnswer[]>(`${SUMMARY_URL}/${quizId}`).catch(rethrow);
    tops = await getData<TopResult[]>(`${SUMMARY_URL}/top/${quizId}`).catch(rethrow);

    resultsElement.innerHTML = '';
    resultsElement.append(...summary.map((answer, idx) => {
      const row = document.createElement('dl');
      const createDD = create('dd');
      const createDT = create('dt');
      const isGoodAnswer = answer.correctAnswer === answer.answer;
      row.append(
        createDT('No'),
        createDD(`${idx + 1}.`),
        createDT('Expression'),
        createDD(answer.expression),
        createDT('Answer'),
        createDD(answer.correctAnswer),
        createDT('Your answer'),
        createDD(answer.answer),
        createDT('Time'),
        createDD(ticksToTime(answer.time)),
        createDT('Averge time'),
        createDD(answer.averge ? ticksToTime(answer.averge) : answer.averge)
      );
      const result = document.createElement('li');
      result.append(row);
      result.classList.add(isGoodAnswer ? 'correct' : 'incorrect');
      return result;
    }));

    const resultTicks = sum(summary.map(({ time }) => time));
    overallElement.innerText = `Your result is ${ticksToTime(resultTicks)}.`;

    topElement.innerHTML = '';
    topElement.append(...tops.map((top) => {
      const row = document.createElement('tr');
      const createCell = create('td');
      row.append(
        createCell(top.username),
        createCell(ticksToTime(top.time))
      );
      return row;
    }));
  } else {
    resultsContainer.innerHTML = '';
  }
}

document.querySelectorAll<HTMLElement>('.buttons>li>.button').forEach((button) => {
  button.onclick = action(() => {
    quizId = parseInt(button.dataset.id ?? '', 10);
  });
});

redraw().catch(makeErrorInfo);