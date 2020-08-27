import { idSelector, isQuiz, ticksToTime, makeErrorInfo, actionWith, makeActiveIfWith, Answer } from './utils.js';

(() => {
  const quiz = JSON.parse(`{
    "intro": "Good luck!",
    "questions": [
      {
        "question": "2 + 2",
        "answer": 4,
        "penalty": 1
      },
      {
        "question": "2 - 2",
        "answer": 0,
        "penalty": 2
      },
      {
        "question": "2 * 2",
        "answer": 4,
        "penalty": 3
      },
      {
        "question": "2 / 2",
        "answer": 1,
        "penalty": 4
      }
    ]
  }`);

  if (!isQuiz(quiz)) {
    makeErrorInfo('Data is in bad format.');
    return;
  }

  const questions = quiz.questions;
  const questionsNumber = Object.keys(questions).length;

  if (questionsNumber === 0) {
    makeErrorInfo('There is no questions.');
    return;
  }

  let showModal: 'abort' | 'finish' | null = null;
  let activeAnswer = 0;
  const answers: Answer[] = questions.map((value) => ({
    ...value,
    currentAnswer: undefined,
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
    answers[activeAnswer].currentAnswer
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
  const abortElement = idSelector('abort');
  clickIfActive(abortElement, () => showModal = 'abort');

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
    const [ESC, ENTER] = [27, 13];
    if (ev.keyCode === ESC) {
      setFocusOnInput(showModal !== null);
      showModal = showModal === null ? 'abort' : null;
    } else if (ev.keyCode === ENTER) {
      if (showModal === null) {
        showModal = isQuizFinished() ? 'finish' : null;
      } else {
        modalConfirm();
      }
    }
  });

  function modalConfirm() {
    if (showModal === 'finish') {
      window.sessionStorage.setItem('answers', JSON.stringify(answers));
    }

    clearTimeout(timer);
    window.location.href = showModal === 'finish' ? '/summary' : '/';
  }

  function isQuizFinished() {
    return Object.values(answers).every(({ currentAnswer }) => currentAnswer !== undefined);
  }

  function redraw() {
    headerQuestion.innerText = `Question ${activeAnswer + 1}/${questionsNumber}`;

    introElement.innerText = quiz.intro;

    const selectedAnswer = answers[activeAnswer];
    labelElement.innerText = `${selectedAnswer.question} = `;
    answerElement.value = selectedAnswer.currentAnswer?.toString() ?? '';
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
})();
