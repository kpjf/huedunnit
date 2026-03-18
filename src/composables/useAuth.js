import { useAuthStore } from '../stores/auth.js'
import { useStatsStore } from '../stores/stats.js'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

export function useAuth() {
  const authStore = useAuthStore()
  const statsStore = useStatsStore()
  const router = useRouter()

  const permissionHierarchy = { user: 0, admin: 1, owner: 2 }

  function checkPermission(role) {
    const permissions = authStore.user?.permissions ?? []
    const userLevel = Math.max(...permissions.map((p) => permissionHierarchy[p] ?? -1))
    return userLevel >= (permissionHierarchy[role] ?? 0)
  }

  async function login(email, password) {
    await authStore.login(email, password)
    await statsStore.fetchStats()
    navigateAfterLogin()
  }

  async function register(userData) {
    await authStore.register(userData)
    await statsStore.fetchStats()
    navigateAfterLogin()
  }

  async function logout(allDevices = false) {
    await authStore.logout(allDevices)
    router.push('/login')
  }

  async function changePassword(currentPassword, newPassword) {
    await authStore.changePassword(currentPassword, newPassword)
    router.push('/login')
  }

  function navigateToLogin(redirectPath) {
    router.push({ path: '/login', query: { redirect: redirectPath } })
  }

  function navigateAfterLogin() {
    const redirect = router.currentRoute.value.query.redirect
    router.push(typeof redirect === 'string' ? redirect : '/')
  }

  return {
    // Reactive state
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    isOwner: computed(() => authStore.isOwner),
    isLoading: computed(() => authStore.isLoading),
    error: computed(() => authStore.error),
    isTokenExpired: computed(() => authStore.isTokenExpired),
    tokenExpiresAt: computed(() => authStore.tokenExpiresAt),
    userDisplayName: computed(() => authStore.userDisplayName),
    userInitials: computed(() => authStore.userInitials),

    // Auth actions
    login,
    register,
    logout,
    refreshTokens: () => authStore.refreshTokens(),
    updateProfile: (data) => authStore.updateProfile(data),
    changePassword,

    // Permission helpers
    hasPermission: (p) => authStore.hasPermission(p),
    checkPermission,

    // Navigation
    navigateToLogin,
    navigateAfterLogin,
  }
}
