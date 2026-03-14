<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import GuessRow from './GuessRow.vue';
import { CONFIG } from '../game/config.js';

const props = defineProps({
    guesses: {
        type: Array,
        required: true,
    },
    currentGuess: {
        type: Array,
        required: true,
    },
    gameOver: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(['remove-at']);

const rows = computed(() => {
    const result = [];
    for (let i = 0; i < CONFIG.MAX_GUESSES; i++) {
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

const boardEl = ref(null);

watch(
    () => props.guesses.length,
    async () => {
        await nextTick();
        if (boardEl.value) {
            boardEl.value.scrollTop = boardEl.value.scrollHeight;
        }
    },
);
</script>

<template>
    <div ref="boardEl" class="game-board">
        <div class="guesses-container">
            <GuessRow
                v-for="(row, i) in rows"
                :key="i"
                :guess-number="i + 1"
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
    overflow-y: auto;
    padding: 16px 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.guesses-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
</style>
