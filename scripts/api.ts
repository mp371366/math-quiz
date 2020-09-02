export type PostResponse = {
  status: boolean;
  message?: string;
};

export function good(): PostResponse {
  return { status: true }
}

export function bad(error: string): PostResponse {
  return {
    status: false,
    message: error,
  };
}

export async function fetchData(request: RequestInfo, init?: RequestInit) {
  return fetch(request, init)
    .then((response) => {
      if (!response.ok || response.status !== 200) {
        throw new Error(`Error when fetching data: ${response.status}.`);
      }

      return response;
    })
    .then((response) => response.json());
}

export async function getData<T>(request: RequestInfo): Promise<T> {
  return fetchData(request);
}

export async function postData<T>(request: RequestInfo, data: T): Promise<PostResponse> {
  const token = document?.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  return fetchData(request, {
    method: 'POST',
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': token ?? '',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });
}