export function isNumber(data: any): data is number {
  return !isNaN(+data);
}

export function isString(data: any): data is string {
  return data !== undefined && typeof data === 'string';
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

export function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

export function arraysEqualAsSets<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1 === arr2) {
    return true;
  }

  if (arr1 === null || arr2 === null) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  const a1 = arr1.concat().sort();
  const a2 = arr2.concat().sort();

  for (let i = 0; i < a1.length; ++i) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }

  return true;
}