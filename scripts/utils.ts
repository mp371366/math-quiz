export type Question = {
  question: string;
  answer: number;
  penalty: number;
}

export type Quiz = {
  intro: string;
  questions: Question[];
}

export type Answer = Question & {
  currentAnswer?: number;
  time: number;
}

export function isNumber(data: any): data is number {
  return !isNaN(+data);
}

export function isQuestion(data: any): data is Question {
  return data
    && data.question !== undefined
    && typeof data.question === 'string'
    && data.answer !== undefined
    && typeof data.answer === 'number'
    && data.penalty !== undefined
    && typeof data.penalty === 'number';
}

export function isQuiz(data: any): data is Quiz {
  return data
    && data.intro !== undefined
    && typeof data.intro === 'string'
    && data.questions !== undefined
    && Object.entries(data.questions).every(([key, value]) => {
      return isNumber(key) && isQuestion(value);
    });
}

export function isAnswers(data: any): data is Answer[] {
  return data && data.every(isAnswer);
}

export function isAnswer(data: any): data is Answer {
  return data
    && ['number', 'undefined'].includes(typeof data.currentAnswer)
    && data.time !== undefined
    && typeof data.time === 'number'
    && isQuestion(data);
}

export function idSelector<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.querySelector(`#${id}`) as T;
}

export function makeErrorInfo(info: string, as: string = 'h2') {
  const mainElement = idSelector('main');
  mainElement.innerHTML = `<${as}>${info}</${as}>`;
}

export function actionWith<T = Event, U = any>(redux: () => any): ((action: (ev: T) => U) => ((ev: T) => U)) {
  return (action: (ev: T) => U) => (ev: T) => {
    const res = action(ev);
    redux();
    return res;
  };
}

export function makeActiveIfWith(className: string): (element: HTMLElement, flag: boolean) => any {
  return (element, flag) => {
    if (flag) {
      element.classList.remove(className);
    } else {
      element.classList.add(className);
    }
  };
}

export function ticksToTime(ticks: number): string {
  const dsecs = ticks / 100;
  const secs = Math.floor(dsecs / 10);
  const minuts = Math.floor(secs / 60);
  const seconds = Math.floor(secs - minuts * 60);
  const dseconds = Math.floor(dsecs % 10);
  return `${minuts}:${seconds.toString().padStart(2, '0')}.${dseconds}`;
}
