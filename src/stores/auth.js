import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const isAdmin = computed(() =>
    user.value?.permissions?.includes('admin') ?? false
  )

  const isOwner = computed(() =>
    user.value?.permissions?.includes('owner') ?? false
  )

  const userFullName = computed(() => {
    const p = user.value?.profile
    if (!p) return ''
    return [p.firstName, p.lastName].filter(Boolean).join(' ')
  })

  const userDisplayName = computed(
    () => user.value?.profile?.displayName || userFullName.value || user.value?.email || ''
  )

  const userInitials = computed(() => {
    const p = user.value?.profile
    if (!p) return ''
    const first = p.firstName?.[0] ?? ''
    const last = p.lastName?.[0] ?? ''
    return (first + last).toUpperCase()
  })

  const tokenExpiresAt = computed(() => {
    if (!accessToken.value) return null
    const decoded = decodeJwt(accessToken.value)
    return decoded?.exp ? decoded.exp * 1000 : null
  })

  const isTokenExpired = computed(() => {
    if (!tokenExpiresAt.value) return true
    return tokenExpiresAt.value < Date.now()
  })

  function hasPermission(permission) {
    return user.value?.permissions?.includes(permission) ?? false
  }

  // Token persistence helpers
  let refreshTimer = null

  function scheduleTokenRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer)
    const expiresAt = tokenExpiresAt.value
    if (!expiresAt) return
    const delay = expiresAt - Date.now() - 60_000 // refresh 1 min before expiry
    if (delay <= 0) return
    refreshTimer = setTimeout(async () => {
      try {
        await refreshTokens()
      } catch {
        // refreshTokens failure already handles logout
      }
    }, delay)
  }

  function persistTokens(access, refresh) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
    scheduleTokenRefresh()
  }

  function clearTokens() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const baseUrl = import.meta.env.VITE_AUTH_SERVICE_URL
  const appSlug = import.meta.env.VITE_APP_SLUG

  async function apiFetch(path, options = {}) {
    const needsSlug =
      path.startsWith('/auth/') ||
      path.startsWith('/users/') ||
      path.startsWith('/sessions/')
    const url = needsSlug ? `${baseUrl}/${appSlug}${path}` : `${baseUrl}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}),
        ...options.headers,
      },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || `Request failed: ${res.status}`)
    }
    return res.json()
  }

  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      persistTokens(data.accessToken, data.refreshToken)
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    isLoading.value = true
    error.value = null
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      persistTokens(data.accessToken, data.refreshToken)
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout(allDevices = false) {
    try {
      const path = allDevices ? '/auth/logout-all' : '/auth/logout'
      await apiFetch(path, {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refreshToken.value }),
      })
    } catch {
      // Clear state regardless of API response
    } finally {
      user.value = null
      clearTokens()
    }
  }

  async function refreshTokens() {
    const current = refreshToken.value
    if (!current) throw new Error('No refresh token')
    const data = await apiFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: current }),
    })
    persistTokens(data.accessToken, data.refreshToken)
    return data
  }

  async function fetchCurrentUser() {
    const data = await apiFetch('/auth/me')
    user.value = data
    return data
  }

  async function updateProfile(profileData) {
    isLoading.value = true
    error.value = null
    try {
      const data = await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      })
      user.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(currentPassword, newPassword) {
    isLoading.value = true
    error.value = null
    try {
      await apiFetch('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      await logout()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function initialize() {
    if (isInitialized.value) return

    if (accessToken.value) {
      try {
        if (isTokenExpired.value) {
          await refreshTokens()
        } else {
          scheduleTokenRefresh()
        }
        await fetchCurrentUser()
      } catch {
        clearTokens()
        user.value = null
      }
    }

    isInitialized.value = true
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    isInitialized,
    // Getters
    isAuthenticated,
    isAdmin,
    isOwner,
    userFullName,
    userDisplayName,
    userInitials,
    tokenExpiresAt,
    isTokenExpired,
    // Methods
    hasPermission,
    login,
    register,
    logout,
    refreshTokens,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    initialize,
  }
})
