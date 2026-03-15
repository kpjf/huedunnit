import { defineStore } from 'pinia'
import { ref } from 'vue'
import { statsApi } from '../utils/auth-client.js'

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

    async function fetchStats() {
        isLoading.value = true
        error.value = null
        try {
            const data = await statsApi.get()
            const isEmpty = !data || Object.keys(data).length === 0
            if (isEmpty) {
                const local = loadLocalStats()
                if (Object.keys(local).length > 0) {
                    await statsApi.post(local)
                    stats.value = local
                } else {
                    stats.value = {}
                }
            } else {
                stats.value = data
            }
        } catch (e) {
            error.value = e.message
            stats.value = loadLocalStats()
        } finally {
            isLoading.value = false
        }
    }

    return { stats, isLoading, error, fetchStats }
})
