import { idSelector, ticksToTime, makeErrorInfo, actionWith, makeActiveIfWith, sum } from './utils.js';
import { getQuiz, finishQuiz } from './api';
import { Answer } from './types';

const quizId = parseInt(document?.querySelector('meta[name="quiz-id"]')?.getAttribute('content') ?? '', 10);
getQuiz(quizId).then((quiz) => {
  const questions = quiz.questions;
  const questionsNumber = questions.length;

  if (questionsNumber === 0) {
    makeErrorInfo('There is no questions.');
    return;
  }

  let showModal: 'finish' | null = null;
  let activeAnswer = 0;
  const answers: (Omit<Answer, 'answer'> & { answer: number | undefined })[] = questions.map((question) => ({
    ...question,
    answer: undefined as number | undefined,
    time: 0,
  }));

  function action<T = Event, U = any>(f: (ev: T) => U): (ev: T) => U {
    return actionWith<T, U>(redraw)(f);
  }

  const headerQuestion = idSelector('header');
  const introElement = idSelector('intro');

  const labelElement = idSelector('label');
  const answerElement = idSelector<HTMLInputElement>('answer');
  answerElement.oninput = action(() => {
    answers[activeAnswer].answer
      = answerElement.value !== ''
        ? answerElement.valueAsNumber
        : undefined;
  });
  const timeElement = idSelector('time');
  const TICK = 25;
  const timer = setInterval(action(() => answers[activeAnswer].time += TICK), TICK);
  const penaltyElement = idSelector('penalty');

  const makeActiveIf = makeActiveIfWith('button-disabled');

  function clickIfActive(element: HTMLElement, f: (ev: MouseEvent) => any) {
    element.onclick = (ev) => {
      if (!element.classList.contains('button-disabled')) {
        action<MouseEvent>(f)(ev);
      }
    }
  }

  const prevElement = idSelector('prev');
  clickIfActive(prevElement, () => activeAnswer-- && setFocusOnInput());
  const nextElement = idSelector('next');
  clickIfActive(nextElement, () => ++activeAnswer && setFocusOnInput());
  const finishElement = idSelector('finish');
  clickIfActive(finishElement, () => showModal = 'finish');

  const modalElement = idSelector('modal');
  const modalHeaderElement = idSelector('modal-header');
  const modalOkElement = idSelector('confirm');
  modalOkElement.onclick = modalConfirm;
  const modalCancelElement = idSelector('cancel');
  modalCancelElement.onclick = action(() => showModal = null);

  function setFocusOnInput(focus: boolean = true) {
    if (focus) {
      answerElement.focus();
    } else {
      answerElement.blur();
    }
  }

  const bodyElement = document.querySelector('body') as HTMLElement;
  bodyElement.onkeydown = action<KeyboardEvent>((ev) => {
    const [ENTER] = [13];
    if (ev.keyCode === ENTER) {
      if (showModal === null) {
        showModal = isQuizFinished() ? 'finish' : null;
      } else {
        modalConfirm();
      }
    }
  });

  const spinnerElement = document.querySelector('.spinner') as HTMLElement;

  function modalConfirm() {
    clearTimeout(timer);

    if (showModal === 'finish') {
      showModal = null;
      redraw();
      spinnerElement.classList.remove('spinner-invisible');
      const allTime = sum(...answers.map(({ time }) => time));
      const results = answers.map(({ id, answer, time }) => ({
        id,
        answer: answer ?? 0,
        time: time / allTime,
      }));
      finishQuiz(quizId, results)
        .then(({ status, message }) => {
          if (!status) {
            throw new Error(message);
          }
        })
        .then(() => window.location.href = `/summary/${quizId}`)
        .catch(makeErrorInfo)
        .finally(() => spinnerElement.classList.add('spinner-invisible'));
    } else {
      window.location.href = '/';
    }
  }

  function isQuizFinished() {
    return Object.values(answers).every(({ answer }) => answer !== undefined);
  }

  function redraw() {
    headerQuestion.innerText = `Question ${activeAnswer + 1}/${questionsNumber}`;

    introElement.innerText = quiz.intro;

    const selectedAnswer = answers[activeAnswer];
    labelElement.innerText = `${selectedAnswer.expression} = `;
    answerElement.value = selectedAnswer.answer?.toString() ?? '';
    timeElement.innerText = ticksToTime(selectedAnswer.time);
    penaltyElement.innerText = `${selectedAnswer.penalty}s`;

    makeActiveIf(prevElement, activeAnswer > 0);
    makeActiveIf(nextElement, activeAnswer < questionsNumber - 1);
    makeActiveIf(finishElement, isQuizFinished());

    makeActiveIfWith('modal-disabled')(modalElement, showModal !== null);
    modalHeaderElement.innerText = `Are you sure that you want to ${showModal} the quiz?`;

    if (showModal !== null) {
      setFocusOnInput(false);
    }
  }

  redraw();
  setFocusOnInput();

  spinnerElement.classList.add('spinner-invisible');
}).catch(makeErrorInfo);
