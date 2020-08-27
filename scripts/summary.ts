import { idSelector, makeErrorInfo, isAnswers, ticksToTime } from './utils.js';

(() => {
  const answers = JSON.parse(window.sessionStorage.getItem('answers') ?? '');
  window.sessionStorage.removeItem('answers');

  if (!isAnswers(answers)) {
    makeErrorInfo('There is no answers');
    return;
  }

  const resultsElement = idSelector('results');
  resultsElement.append(...Object.values(answers).map((answer, idx) => {
    const row = document.createElement('dl');
    const create = (as: string) => (innerText: string | number | undefined): HTMLElement => {
      const element = document.createElement(as);
      element.innerText = innerText?.toString() ?? 'N/A';
      return element;
    };
    const createDD = create('dd');
    const createDT = create('dt');
    const isGoodAnswer = answer.answer === answer.currentAnswer;
    const penalty = 1000 * (isGoodAnswer ? 0 : answer.penalty);
    row.append(
      createDT('No'),
      createDD(`${idx + 1}.`),
      createDT('Expression'),
      createDD(answer.question),
      createDT('Answer'),
      createDD(answer.answer),
      createDT('Your answer'),
      createDD(answer.currentAnswer),
      createDT('Time'),
      createDD(ticksToTime(answer.time + penalty))
    );
    const result = document.createElement('li');
    result.append(row);
    result.classList.add(isGoodAnswer ? 'correct' : 'incorrect');
    return result;
  }));


  const overallElement = idSelector('overall');
  const resultTicks = Object.values(answers).reduce((acc, { time, currentAnswer, answer, penalty }) => {
    return acc + time + (currentAnswer === answer ? 0 : penalty * 1000);
  }, 0);
  overallElement.innerText = `Your result is ${ticksToTime(resultTicks)}.`;

  function moveBack() {
    window.location.href = '/';
  }

  function makeSave<T>(data: T) {
    window.localStorage.setItem('save', JSON.stringify(data))
  }

  const onlyResultElement = idSelector('save-with-details');
  onlyResultElement.onclick = () => {
    makeSave(answers);
    moveBack();
  };
  const withDetailsElement = idSelector('only-result');
  withDetailsElement.onclick = () => {
    makeSave(resultTicks);
    moveBack();
  };
  const dontSaveElement = idSelector('no-save');
  dontSaveElement.onclick = moveBack;
})();
