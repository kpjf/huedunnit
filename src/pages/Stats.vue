<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStatsStore } from '../stores/stats.js';
import { MODES } from '../game/config.js';
import AppButton from '../components/AppButton.vue';
import { useDarkMode } from '../composables/useDarkMode.js';
import { loadDailyState } from '../game/useDailyStorage.js';

const router = useRouter();
const route = useRoute();
const statsStore = useStatsStore();
const activeTab = ref('quick');
useDarkMode();

const today = new Date().toISOString().slice(0, 10);

function todayGuessCount(mode) {
    const saved = loadDailyState(today, mode);
    if (!saved || !saved.gameOver) return null;
    return saved.won ? saved.guesses.length : null;
}

onMounted(() => {
    if (['quick', 'classic'].includes(route.query.tab)) {
        activeTab.value = route.query.tab;
    }
    if (statsStore.stats === null) {
        statsStore.fetchStats();
    }
});

function modeStats(mode) {
    const s = statsStore.stats?.[mode];
    if (!s || !s.distribution) return { streak: 0, lastWonDate: null, distribution: {} };
    return s;
}

function totalGames(mode) {
    const dist = modeStats(mode).distribution;
    if (!dist) return 0;
    return Object.values(dist).reduce((a, b) => a + b, 0);
}

function maxDistCount(mode) {
    return Math.max(1, ...Object.values(modeStats(mode).distribution));
}
</script>

<template>
    <div class="stats-page">
        <div class="stats-card">
            <div class="stats-header">
                <h1 class="stats-title">Statistics</h1>
                <AppButton variant="ghost" size="sm" @click="router.push('/')">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px;">
                        <path d="M13 4L7 10L13 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                    </svg>
                    Back
                </AppButton>
            </div>

            <div class="tabs">
                <button
                    class="tab"
                    :class="{ active: activeTab === 'quick' }"
                    @click="activeTab = 'quick'"
                >Quick</button>
                <button
                    class="tab"
                    :class="{ active: activeTab === 'classic' }"
                    @click="activeTab = 'classic'"
                >Classic</button>
            </div>

            <div v-if="statsStore.isLoading" class="loading">Loading stats…</div>

            <div v-else-if="statsStore.stats">
                <p class="mode-subtitle">
                    {{ MODES[activeTab].CODE_LENGTH }} colors · {{ MODES[activeTab].MAX_GUESSES }} guesses
                </p>

                <div class="summary-row">
                    <div class="summary-stat">
                        <span class="summary-number">{{ totalGames(activeTab) }}</span>
                        <span class="summary-label">Played</span>
                    </div>
                    <div class="summary-stat">
                        <span class="summary-number">{{ modeStats(activeTab).streak }}</span>
                        <span class="summary-label">Streak</span>
                    </div>
                </div>

                <div class="distribution">
                    <div class="distribution-title">Guess Distribution</div>
                    <div v-for="n in MODES[activeTab].MAX_GUESSES" :key="n" class="dist-row">
                        <span class="dist-label" :class="{ today: todayGuessCount(activeTab) === n }">{{ n }}</span>
                        <div class="dist-bar-wrap">
                            <div
                                class="dist-bar"
                                :class="{ today: todayGuessCount(activeTab) === n }"
                                :style="{
                                    width:
                                        ((modeStats(activeTab).distribution[String(n)] ?? 0) /
                                            maxDistCount(activeTab)) *
                                            100 +
                                        '%',
                                }"
                            >
                                <span v-if="modeStats(activeTab).distribution[String(n)]">
                                    {{ modeStats(activeTab).distribution[String(n)] }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="statsStore.error" class="error-msg">
                Could not load from server — showing local data.
            </div>
        </div>
    </div>
</template>

<style scoped>
.stats-page {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}

.stats-card {
    background: var(--bg-primary);
    max-width: 440px;
    width: 100%;
    padding: 40px 32px;
    animation: slideIn 0.3s ease-out;
}

.stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
}

.stats-title {
    font-size: 2em;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}


.tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 24px;
}

.tab {
    flex: 1;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 10px 0;
    margin-bottom: -1px;
    font-size: 0.9em;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
}

.tab.active {
    color: var(--text-primary);
    border-bottom-color: var(--text-primary);
}

.tab:hover:not(.active) {
    color: var(--text-primary);
}

.mode-subtitle {
    font-size: 0.8em;
    color: var(--text-secondary);
    margin: 0 0 20px;
}

.summary-row {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
}

.summary-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.summary-number {
    font-size: 2.5em;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
}

.summary-label {
    font-size: 0.72em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
}

.distribution {
    text-align: left;
}

.distribution-title {
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-bottom: 10px;
}

.dist-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
}

.dist-label {
    font-size: 0.85em;
    font-weight: 600;
    color: var(--text-secondary);
    width: 16px;
    text-align: right;
    flex-shrink: 0;
}

.dist-label.today {
    color: var(--peg-green);
}

.dist-bar-wrap {
    flex: 1;
    background: var(--bg-secondary);
    height: 22px;
    border-radius: 2px;
    overflow: hidden;
}

.dist-bar {
    height: 100%;
    min-width: 28px;
    background: var(--text-secondary);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 7px;
    font-size: 0.78em;
    font-weight: 700;
    color: #fff;
    transition: width 0.4s ease;
}

.dist-bar.today {
    background: var(--peg-green);
}

.loading {
    text-align: center;
    color: var(--text-secondary);
    padding: 40px 0;
    font-size: 0.9em;
}

.error-msg {
    font-size: 0.8em;
    color: var(--text-secondary);
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

@media (max-width: 480px) {
    .stats-card {
        padding: 28px 20px;
    }

    .stats-title {
        font-size: 1.75em;
    }
}
</style>
