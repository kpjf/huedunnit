<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStatsStore } from '../stores/stats.js';
import { MODES } from '../game/config.js';

const router = useRouter();
const statsStore = useStatsStore();

onMounted(() => {
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

    if (!dist) {
        return 0;
    }
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
                <button class="btn-back" @click="router.push('/')">← Back</button>
            </div>

            <div v-if="statsStore.isLoading" class="loading">Loading stats…</div>

            <div v-else-if="statsStore.stats">
                <div v-for="mode in ['classic', 'quick']" :key="mode" class="mode-section">
                    <h2 class="mode-title">{{ mode === 'classic' ? 'Classic' : 'Quick' }}</h2>
                    <p class="mode-subtitle">
                        {{
                            mode === 'classic'
                                ? `${MODES.classic.CODE_LENGTH} colors · ${MODES.classic.MAX_GUESSES} guesses`
                                : `${MODES.quick.CODE_LENGTH} colors · ${MODES.quick.MAX_GUESSES} guesses`
                        }}
                    </p>

                    <div class="summary-row">
                        <div class="summary-stat">
                            <span class="summary-number">{{ totalGames(mode) }}</span>
                            <span class="summary-label">Played</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-number">{{ modeStats(mode).streak }}</span>
                            <span class="summary-label">Streak</span>
                        </div>
                    </div>

                    <div class="distribution">
                        <div class="distribution-title">Guess Distribution</div>
                        <div v-for="n in MODES[mode].MAX_GUESSES" :key="n" class="dist-row">
                            <span class="dist-label">{{ n }}</span>
                            <div class="dist-bar-wrap">
                                <div
                                    class="dist-bar"
                                    :style="{
                                        width:
                                            ((modeStats(mode).distribution[String(n)] ?? 0) /
                                                maxDistCount(mode)) *
                                                100 +
                                            '%',
                                    }"
                                >
                                    <span v-if="modeStats(mode).distribution[String(n)]">
                                        {{ modeStats(mode).distribution[String(n)] }}
                                    </span>
                                </div>
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

.btn-back {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 6px 14px;
    font-size: 0.85em;
    font-weight: 600;
    cursor: pointer;
}

.btn-back:hover {
    color: var(--text-primary);
    border-color: var(--text-secondary);
}

.mode-section {
    margin-bottom: 40px;
    padding-bottom: 40px;
    border-bottom: 1px solid var(--border-color);
}

.mode-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.mode-title {
    font-size: 1.25em;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px;
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
