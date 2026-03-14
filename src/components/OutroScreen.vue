<script setup>
import { computed, ref } from 'vue';

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

const emit = defineEmits(['play-again', 'show-stats']);

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

const copied = ref(false);

function buildShareText() {
    const header = isDaily.value ? `HEXCode - ${today}` : 'HEXCode - Random Game';
    const score = `${props.guessCount}/${props.maxGuesses}`;
    const grid = props.guesses
        .map(({ feedback }) => {
            const { blackPegs, whitePegs } = feedback;
            const misses = props.codeLength - blackPegs - whitePegs;
            return '🟩'.repeat(blackPegs) + '🟨'.repeat(whitePegs) + '⬜'.repeat(misses);
        })
        .join('\n');
    return `${header}\n${score}\n\n${grid}`;
}

async function handleShare() {
    try {
        await navigator.clipboard.writeText(buildShareText());
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch {
        // clipboard not available — silent fail
    }
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
                <button class="btn btn-primary outro-btn" @click="handleShare">
                    {{ copied ? 'Copied!' : 'Share Results' }}
                </button>
                <button
                    class="btn btn-secondary outro-btn"
                    :disabled="!stats"
                    :title="stats ? undefined : 'Play a daily puzzle to track stats'"
                    @click="$emit('show-stats')"
                >
                    Stats
                </button>
            </div>

            <div class="outro-footer">
                <button class="btn btn-ghost" @click="$emit('play-again')">Play Again</button>
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
    padding: 13px 20px;
    font-size: 1em;
}

.outro-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.outro-footer {
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
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
