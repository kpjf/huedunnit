import { defineStore } from 'pinia'
import { ref } from 'vue'
import { statsApi } from '../utils/auth-client.js'
import { useAuthStore } from './auth.js'

const STORAGE_KEY = 'hexcode-stats'

function loadLocalStats() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
        return {}
    }
}

export const useStatsStore = defineStore('stats', () => {
    const stats = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    function saveLocalStats(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }

    function stripMeta({ _id, userId, createdAt, ...rest }) {
        return rest
    }

    async function fetchStats() {
        isLoading.value = true
        error.value = null
        try {
            const data = await statsApi.get()
            const isEmpty = !data || Object.keys(data).length === 0
            if (isEmpty) {
                // First-time login: migrate any existing local stats up to the server
                const local = loadLocalStats()
                if (Object.keys(local).length > 0) {
                    await statsApi.post(stripMeta(local))
                    stats.value = local
                } else {
                    stats.value = {}
                }
            } else {
                // Server is source of truth — save server data locally
                saveLocalStats(data)
                stats.value = data
            }
        } catch (e) {
            error.value = e.message
            stats.value = loadLocalStats()
        } finally {
            isLoading.value = false
        }
    }

    async function pushStats() {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return
        try {
            const local = loadLocalStats()
            if (Object.keys(local).length > 0) {
                await statsApi.post(stripMeta(local))
                stats.value = local
            }
        } catch {
            // best-effort — ignore errors
        }
    }

    return { stats, isLoading, error, fetchStats, pushStats }
})
