export type Response<T> = {
  status: boolean;
  message?: string;
  value?: T;
};

export function good<T>(value: T): Response<T> {
  return {
    status: true,
    value,
  }
}

export function bad<T>({ message }: Error): Response<T> {
  return {
    status: false,
    message,
  };
}

export async function wrapResponse<T>(res: Promise<T>) {
  return res
    .then(good)
    .catch((error: Error) => bad<T>(error));
}

export async function fetchData<T>(request: RequestInfo, init?: RequestInit) {
  return fetch(request, init)
    .then((response) => {
      if (!response.ok || response.status !== 200) {
        throw new Error(`Error when fetching data: ${response.status}.`);
      }

      return response;
    })
    .then((response) => response.json() as Promise<Response<T>>)
    .then((response) => {
      if (!response.status) {
        throw new Error(response.message);
      }

      return response.value as T;
    });
}

export async function getData<T>(request: RequestInfo) {
  return fetchData<T>(request);
}

export async function postData<T, U = void>(request: RequestInfo, data?: T, token?: string) {
  const headers = new Headers({
    'Content-Type': 'application/json'
  });

  token = token ?? document?.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? undefined;

  if (token !== undefined) {
    headers.append('CSRF-Token', token);
  }

  return fetchData<U>(request, {
    method: 'POST',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers,
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });
}