<script setup>
import { computed } from 'vue';

const props = defineProps({
    guessNumber: { type: Number, required: true },
    codeLength: { type: Number, required: true },
    code: { type: Array, default: null },
    feedback: { type: Object, default: null },
    isActive: { type: Boolean, default: false },
});

const emit = defineEmits(['remove-at']);

const displayPegs = computed(() => {
    const slots = [];
    for (let i = 0; i < props.codeLength; i++) {
        slots.push(props.code?.[i] ?? null);
    }
    return slots;
});

const keyPegs = computed(() => {
    if (!props.feedback) return Array(props.codeLength).fill('empty');
    const pegs = [];
    for (let i = 0; i < props.feedback.blackPegs; i++) pegs.push('black');
    for (let i = 0; i < props.feedback.whitePegs; i++) pegs.push('white');
    while (pegs.length < props.codeLength) pegs.push('empty');
    return pegs;
});
</script>

<template>
    <div class="guess-row" :class="{ active: isActive, completed: feedback !== null }">
        <div class="guess-pegs">
            <div
                v-for="(color, i) in displayPegs"
                :key="i"
                class="peg"
                :class="color ?? 'empty'"
                :style="isActive && color ? { cursor: 'pointer' } : {}"
                @click="isActive && color ? emit('remove-at', i) : undefined"
            />
        </div>
        <div class="key-pegs">
            <div v-for="(type, i) in keyPegs" :key="i" class="key-peg" :class="type" />
        </div>
    </div>
</template>

<style scoped>
.guess-row {
    height: var(--row-height, 60px);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0.45;
    transform: scale(0.8);
    transform-origin: center center;
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.guess-row.active {
    opacity: 1;
    transform: scale(1);
}

.guess-row.completed {
    opacity: 0.85;
    transform: scale(0.9);
}

.guess-row .guess-pegs {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
}

.guess-row .key-pegs {
    width: var(--peg-size, 50px);
    height: var(--peg-size, 50px);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 3px;
    margin-left: 8px;
    flex-shrink: 0;
}
</style>
