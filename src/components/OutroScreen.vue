<script setup>
import { computed, ref } from 'vue';
import AppButton from './AppButton.vue';
import { useShareImage } from '../composables/useShareImage.js';

const props = defineProps({
    won: { type: Boolean, required: true },
    guessCount: { type: Number, required: true },
    guesses: { type: Array, required: true },
    secretCode: { type: Array, required: true },
    seed: { type: String, default: null },
    maxGuesses: { type: Number, required: true },
    codeLength: { type: Number, required: true },
    stats: { type: Object, default: null },
});

const emit = defineEmits(['play-again', 'show-stats', 'review']);

const isDaily = computed(() => props.seed !== null);

const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});

const heading = computed(() => {
    if (!props.won) return 'Unlucky!';
    if (props.guessCount === 1) return 'First try!';
    if (props.guessCount <= 2) return 'Outstanding!';
    if (props.guessCount <= 4) return 'Nice work!';
    if (props.guessCount <= 7) return 'You got it!';
    return 'Close call!';
});

const shared = ref(false);
const { shareResults } = useShareImage();

async function handleShare() {
    await shareResults({
        guesses: props.guesses,
        codeLength: props.codeLength,
        maxGuesses: props.maxGuesses,
        isDaily: isDaily.value,
        onCopied: () => {
            shared.value = true;
            setTimeout(() => { shared.value = false; }, 2000);
        },
    });
}
</script>

<template>
    <div class="outro-container">
        <div class="outro-card">
            <div class="outro-icon">{{ won ? '🎉' : '😞' }}</div>

            <h1 class="outro-title">{{ heading }}</h1>
            <p class="outro-subtitle">
                <template v-if="won">
                    You cracked the code in
                    <strong>{{ guessCount }}</strong> / {{ maxGuesses }} guesses
                </template>
                <template v-else>
                    Better luck next time
                </template>
            </p>

            <div class="secret-code-block">
                <span class="secret-code-label">The secret code</span>
                <div class="secret-code">
                    <div v-for="(color, i) in secretCode" :key="i" class="peg" :class="color" />
                </div>
            </div>

            <div v-if="isDaily" class="outro-puzzle-date">
                <span class="date-label">Today's Puzzle</span>
                <span class="date-value">{{ today }}</span>
            </div>

            <div class="outro-actions">
                <AppButton class="outro-btn" @click="handleShare">
                    {{ shared ? 'Saved!' : 'Share Results' }}
                </AppButton>
                <AppButton
                    variant="secondary"
                    class="outro-btn"
                    :disabled="!stats"
                    :title="stats ? undefined : 'Play a daily puzzle to track stats'"
                    @click="$emit('show-stats')"
                >
                    Stats
                </AppButton>
            </div>

            <AppButton variant="ghost" size="sm" full class="review-toggle-btn" @click="$emit('review')">
                Review Your Solution
            </AppButton>

            <div class="outro-footer">
                <AppButton variant="ghost" size="sm" full @click="$emit('play-again')">Play Again</AppButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
.outro-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}

.outro-card {
    background: var(--bg-primary);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    padding: 40px 32px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    animation: slideIn 0.3s ease-out;
}

.outro-icon {
    font-size: 3em;
    margin-bottom: 16px;
    line-height: 1;
}

.outro-title {
    font-size: 2em;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.outro-subtitle {
    color: var(--text-secondary);
    font-size: 0.95em;
    margin-bottom: 28px;
}

.outro-subtitle strong {
    color: var(--text-primary);
    font-size: 1.1em;
}

.secret-code-block {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.secret-code-label {
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
}

.secret-code {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.secret-code .peg {
    cursor: default;
}

.outro-puzzle-date {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 12px 16px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.date-label {
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
}

.date-value {
    font-size: 0.95em;
    font-weight: 600;
    color: var(--text-primary);
}

.outro-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
}

.outro-btn {
    flex: 1;
}

.review-toggle-btn {
    margin-bottom: 12px;
}

.outro-footer {
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

@media (max-width: 480px) {
    .outro-card {
        padding: 32px 24px;
    }

    .outro-icon {
        font-size: 2.5em;
    }

    .outro-title {
        font-size: 1.75em;
    }
}
</style>
