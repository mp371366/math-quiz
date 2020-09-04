export function idSelector<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.querySelector(`#${id}`) as T;
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

export function makeErrorInfo(info: string, as: string = 'h2') {
  const mainElement = idSelector('main');
  mainElement.innerHTML = `<${as}>${info}</${as}>`;
}

export function rethrow(error: Error): never {
  throw error;
}

export async function tryExec(f: () => Promise<any>) {
  await f()
    .catch((error: Error) => makeErrorInfo(error.message));
}