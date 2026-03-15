import { useAuthStore } from '../stores/auth.js'

const TIMEOUT_MS = 10_000

class AuthClient {
  #baseUrl
  #isRefreshing = false
  #refreshQueue = []

  constructor(baseUrl) {
    this.#baseUrl = baseUrl
  }

  async #request(path, options = {}) {
    const authStore = useAuthStore()

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const makeRequest = async (token) => {
      const res = await fetch(`${this.#baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      })
      return res
    }

    try {
      let res = await makeRequest(authStore.accessToken)

      if (res.status === 401) {
        // Queue concurrent 401s while a refresh is in progress
        if (this.#isRefreshing) {
          const retryToken = await new Promise((resolve, reject) => {
            this.#refreshQueue.push({ resolve, reject })
          })
          res = await makeRequest(retryToken)
        } else {
          this.#isRefreshing = true
          try {
            await authStore.refreshTokens()
            const newToken = authStore.accessToken
            this.#refreshQueue.forEach(({ resolve }) => resolve(newToken))
            this.#refreshQueue = []
            res = await makeRequest(newToken)
          } catch {
            this.#refreshQueue.forEach(({ reject }) => reject(new Error('Session expired')))
            this.#refreshQueue = []
            await authStore.logout()
            throw new Error('Session expired. Please log in again.')
          } finally {
            this.#isRefreshing = false
          }
        }
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Request failed: ${res.status}`)
      }

      // Handle empty responses (e.g. 204 No Content)
      const text = await res.text()
      return text ? JSON.parse(text) : null
    } finally {
      clearTimeout(timer)
    }
  }

  get(path, options = {}) {
    return this.#request(path, { ...options, method: 'GET' })
  }

  post(path, body, options = {}) {
    return this.#request(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  put(path, body, options = {}) {
    return this.#request(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  delete(path, options = {}) {
    return this.#request(path, { ...options, method: 'DELETE' })
  }
}

const client = new AuthClient(import.meta.env.VITE_AUTH_SERVICE_URL)
const dataClient = new AuthClient(import.meta.env.VITE_DATA_API_URL)

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (userData) => client.post('/auth/register', userData),
  logout: (refreshToken) => client.post('/auth/logout', { refreshToken }),
  logoutAll: () => client.post('/auth/logout-all'),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  me: () => client.get('/auth/me'),
}

export const userApi = {
  getProfile: () => client.get('/users/me'),
  updateProfile: (data) => client.put('/users/me', data),
  changePassword: (currentPassword, newPassword) =>
    client.put('/users/me/password', { currentPassword, newPassword }),
}

export const sessionApi = {
  getMySessions: () => client.get('/sessions/me'),
  invalidateSession: (id) => client.delete(`/sessions/me/${id}`),
  invalidateAllSessions: () => client.delete('/sessions/me'),
}

export const statsApi = {
  get: () => dataClient.get('/v1/stats'),
  post: (data) => dataClient.post('/v1/stats', data),
}
