const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request(path, options = {}) {
  const token = localStorage.getItem('library-token')
  const headers = new Headers(options.headers || {})
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch (error) {
    throw new ApiError('Cannot connect to the library server. Please try again later.', 0)
  }
  if (response.status === 401) {
    localStorage.removeItem('library-token')
    window.dispatchEvent(new Event('library:unauthorized'))
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new ApiError(payload.message || payload.error || `Request failed (${response.status})`, response.status)
  }
  if (response.status === 204) return null
  return response.json()
}

export const booksApi = {
  list: (params = {}) => request(`/books${params.query || params.category ? `?${new URLSearchParams(params)}` : ''}`),
  get: (id) => request(`/books/${id}`),
  create: (book) => request('/books', { method: 'POST', body: JSON.stringify(book) }),
  update: (id, book) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(book) }),
  remove: (id) => request(`/books/${id}`, { method: 'DELETE' }),
}

export const authApi = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
}

export const borrowingApi = {
  mine: () => request('/borrowing/my-records'),
  history: () => request('/borrowing/history'),
  borrow: (bookId) => request(`/borrowing/borrow/${bookId}`, { method: 'POST' }),
  return: (recordId) => request(`/borrowing/return/${recordId}`, { method: 'POST' }),
}

export const adminApi = {
  users: () => request('/admin/users'),
  records: () => request('/admin/records'),
  stats: () => request('/admin/stats'),
}
