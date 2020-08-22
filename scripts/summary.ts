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
    const row = document.createElement('tr');
    const createCell = (innerText: string | number | undefined): HTMLTableCellElement => {
      const cell = document.createElement('td') as HTMLTableCellElement;
      cell.innerText = innerText?.toString() ?? 'N/A';
      return cell;
    };
    const isGoodAnswer = answer.answer === answer.currentAnswer;
    const penalty = 1000 * (isGoodAnswer ? 0 : answer.penalty);
    row.append(
      createCell(`${idx + 1}.`),
      createCell(answer.question),
      createCell(answer.answer),
      createCell(answer.currentAnswer),
      createCell(isGoodAnswer ? 'Ok' : 'Bad'),
      createCell(ticksToTime(answer.time + penalty))
    );
    row.classList.add(isGoodAnswer ? 'correct' : 'incorrect');
    return row;
  }));


  const overallElement = idSelector('overall');
  const resultTicks = Object.values(answers).reduce((acc, { time, currentAnswer, answer, penalty }) => {
    return acc + time + (currentAnswer === answer ? 0 : penalty * 1000);
  }, 0);
  overallElement.innerText = `Your result is ${ticksToTime(resultTicks)}.`;

  function moveBack() {
    window.location.href = 'index.html';
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
