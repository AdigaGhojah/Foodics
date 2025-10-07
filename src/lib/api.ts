const DEV = import.meta.env.DEV
const BASE_URL = DEV ? '/api' : (import.meta.env.VITE_API_URL as string)
const TOKEN = import.meta.env.VITE_API_TOKEN as string

function joinURL(base: string, path: string) {
  if (path.startsWith('http')) return path
  const slash = base.endsWith('/') || path.startsWith('/') ? '' : '/'
  return `${base}${slash}${path}`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {})
  headers.set('Accept', 'application/json')
  if (TOKEN) headers.set('Authorization', `Bearer ${TOKEN}`)
  // set Content-Type only when sending a body that isn't FormData
  const hasBody = init.body && !(init.body instanceof FormData)
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(joinURL(BASE_URL, path), { ...init, headers })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const ct = res.headers.get('content-type') || ''
  return (ct.includes('application/json') ? res.json() : res.text()) as Promise<T>
}

export function getJSON<T>(path: string, init?: RequestInit) {
  return request<T>(path, { ...init, method: 'GET' })
}

export function putJSON<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  })
}
