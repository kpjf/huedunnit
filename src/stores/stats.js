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

function todayStr() {
    return new Date().toISOString().slice(0, 10)
}

function yesterdayOf(dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
}

/**
 * Server is gospel. But if local has a result recorded TODAY that the server
 * doesn't have yet (e.g. played while session was expired, then logged in),
 * inject only that today-only data so the streak survives.
 */
function mergeLocalTodayIntoServer(server, local) {
    const today = todayStr()
    let changed = false
    const merged = { ...server }

    for (const mode of Object.keys(local)) {
        const localMode = local[mode]
        // Only care about modes where something was recorded today locally
        if (localMode.lastRecordedDate !== today) continue

        const serverMode = merged[mode] ?? {
            streak: 0,
            lastWonDate: null,
            lastRecordedDate: null,
            distribution: {},
            dailies: [],
        }
        // Server already has today's result — nothing to inject
        if (serverMode.lastRecordedDate === today) continue

        changed = true
        const won = localMode.lastWonDate === today
        const updated = { ...serverMode, lastRecordedDate: today }

        if (won) {
            updated.lastWonDate = today
            const streakContinues = serverMode.lastWonDate === yesterdayOf(today)
            updated.streak = streakContinues ? serverMode.streak + 1 : 1
            const todayDaily = (localMode.dailies ?? []).find((d) => d.date === today)
            if (todayDaily) {
                updated.dailies = [...(serverMode.dailies ?? []), todayDaily]
                if (todayDaily.guessCount != null) {
                    const key = String(todayDaily.guessCount)
                    updated.distribution = { ...serverMode.distribution }
                    updated.distribution[key] = (updated.distribution[key] ?? 0) + 1
                }
            }
        } else {
            updated.streak = 0
        }

        merged[mode] = updated
    }

    return { merged, changed }
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
                // Server is source of truth, but rescue any result recorded today
                // while the user was unauthenticated (e.g. expired session).
                const local = loadLocalStats()
                const { merged, changed } = mergeLocalTodayIntoServer(data, local)
                saveLocalStats(merged)
                stats.value = merged
                if (changed) {
                    // Push the merged result back so the server is also up to date
                    statsApi.post(stripMeta(merged)).catch(() => {})
                }
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
