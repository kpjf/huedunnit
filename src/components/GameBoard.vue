<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import GuessRow from './GuessRow.vue';

const props = defineProps({
    guesses: { type: Array, required: true },
    currentGuess: { type: Array, required: true },
    gameOver: { type: Boolean, required: true },
    maxGuesses: { type: Number, required: true },
    codeLength: { type: Number, required: true },
    animateRows: { type: Boolean, default: false },
    selectedPegIndex: { type: Number, default: null },
});

const emit = defineEmits(['remove-at', 'select-slot']);

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

const containerEl = ref(null);
const rowHeight = ref(60);
const pegSize = ref(50);

function computeSizes() {
    if (!containerEl.value) return;
    const N = props.maxGuesses;
    const gap = 6;
    const available = containerEl.value.getBoundingClientRect().height;
    const rawRow = Math.floor((available - (N - 1) * gap) / N);
    rowHeight.value = Math.min(rawRow, 52);
    pegSize.value = Math.min(rowHeight.value, 50);
}

let resizeObserver = null;

onMounted(async () => {
    await nextTick();
    computeSizes();
    resizeObserver = new ResizeObserver(computeSizes);
    if (containerEl.value) resizeObserver.observe(containerEl.value);
});

onUnmounted(() => {
    resizeObserver?.disconnect();
});

watch(() => props.maxGuesses, computeSizes);
</script>

<template>
    <div class="game-board">
        <div
            ref="containerEl"
            class="guesses-container"
            :style="{ '--row-height': rowHeight + 'px', '--peg-size': pegSize + 'px' }"
        >
            <GuessRow
                v-for="(row, i) in rows"
                :key="i"
                :guess-number="i + 1"
                :code-length="codeLength"
                :code="row.code"
                :feedback="row.feedback"
                :is-active="row.type === 'active'"
                :reveal-all="animateRows"
                :selected-index="row.type === 'active' ? selectedPegIndex : null"
                @remove-at="emit('remove-at', $event)"
                @select-slot="emit('select-slot', $event)"
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
    gap: 6px;
}
</style>
