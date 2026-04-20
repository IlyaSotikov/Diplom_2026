const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost/Diplom_2026/server/public/index.php'

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
}

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = (await response.json()) as T & { ok?: boolean; message?: string }
  if (!response.ok) {
    throw new Error(data.message ?? 'Ошибка запроса к серверу.')
  }

  return data
}

