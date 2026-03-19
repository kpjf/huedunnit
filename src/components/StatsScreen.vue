<script setup>
import { computed } from 'vue';
import AppButton from './AppButton.vue';

const props = defineProps({
    stats: { type: Object, required: true },
    maxGuesses: { type: Number, required: true },
    won: { type: Boolean, default: false },
    guessCount: { type: Number, default: 0 },
});

const emit = defineEmits(['close']);

const maxDistCount = computed(() => {
    return Math.max(1, ...Object.values(props.stats.distribution));
});
</script>

<template>
    <div class="stats-container">
        <div class="stats-card">
            <h1 class="stats-title">Statistics</h1>

            <div class="streak-block">
                <span class="streak-number">{{ stats.streak }}</span>
                <span class="streak-label">Current Streak</span>
            </div>

            <div class="distribution">
                <div class="distribution-title">Guess Distribution</div>
                <div v-for="n in maxGuesses" :key="n" class="dist-row">
                    <span class="dist-label">{{ n }}</span>
                    <div class="dist-bar-wrap">
                        <div
                            class="dist-bar"
                            :class="{ highlight: won && guessCount === n }"
                            :style="{
                                width:
                                    ((stats.distribution[String(n)] ?? 0) / maxDistCount) * 100 +
                                    '%',
                            }"
                        >
                            <span v-if="stats.distribution[String(n)]">
                                {{ stats.distribution[String(n)] }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats-footer">
                <AppButton variant="ghost" size="md" @click="$emit('close')">Back</AppButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stats-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}

.stats-card {
    background: var(--bg-primary);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    padding: 40px 32px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    animation: slideIn 0.3s ease-out;
}

.stats-title {
    font-size: 2em;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 28px;
}

.streak-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
}

.streak-number {
    font-size: 4em;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
}

.streak-label {
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-top: 6px;
}

.distribution {
    text-align: left;
    margin-bottom: 32px;
}

.distribution-title {
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-bottom: 12px;
    text-align: center;
}

.dist-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
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
    height: 24px;
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
    font-size: 0.8em;
    font-weight: 700;
    color: #fff;
    transition: width 0.4s ease;
}

.dist-bar.highlight {
    background: #3a7d44;
}

.stats-footer {
    padding-top: 16px;
}

.btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    padding: 8px 20px;
    font-size: 0.88em;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
}

.btn-ghost:hover {
    color: var(--text-primary);
    border-color: var(--text-secondary);
}

@media (max-width: 480px) {
    .stats-card {
        padding: 32px 24px;
    }

    .stats-title {
        font-size: 1.75em;
    }

    .streak-number {
        font-size: 3.5em;
    }
}
</style>
