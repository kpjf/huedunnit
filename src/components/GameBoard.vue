<script setup>
import { computed } from 'vue';
import GuessRow from './GuessRow.vue';

const props = defineProps({
    guesses: { type: Array, required: true },
    currentGuess: { type: Array, required: true },
    gameOver: { type: Boolean, required: true },
    maxGuesses: { type: Number, required: true },
    codeLength: { type: Number, required: true },
});

const emit = defineEmits(['remove-at']);

const rows = computed(() => {
    const result = [];
    for (let i = 0; i < props.maxGuesses; i++) {
        if (i < props.guesses.length) {
            result.push({
                type: 'completed',
                code: props.guesses[i].code,
                feedback: props.guesses[i].feedback,
            });
        } else if (i === props.guesses.length && !props.gameOver) {
            result.push({ type: 'active', code: props.currentGuess, feedback: null });
        } else {
            result.push({ type: 'empty', code: null, feedback: null });
        }
    }
    return result;
});
</script>

<template>
    <div class="game-board">
        <div class="guesses-container">
            <GuessRow
                v-for="(row, i) in rows"
                :key="i"
                :guess-number="i + 1"
                :code-length="codeLength"
                :code="row.code"
                :feedback="row.feedback"
                :is-active="row.type === 'active'"
                @remove-at="emit('remove-at', $event)"
            />
        </div>
    </div>
</template>

<style scoped>
.game-board {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: 16px 8px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.guesses-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
}
</style>
