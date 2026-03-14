<script setup>
import { computed } from 'vue';
import { CONFIG } from '../game/config.js';

const props = defineProps({
    guessNumber: {
        type: Number,
        required: true,
    },
    code: {
        type: Array,
        default: null,
    },
    feedback: {
        type: Object,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['remove-at']);

const displayPegs = computed(() => {
    const slots = [];
    for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
        slots.push(props.code?.[i] ?? null);
    }
    return slots;
});

const keyPegs = computed(() => {
    if (!props.feedback) return Array(CONFIG.CODE_LENGTH).fill('empty');
    const pegs = [];
    for (let i = 0; i < props.feedback.blackPegs; i++) pegs.push('black');
    for (let i = 0; i < props.feedback.whitePegs; i++) pegs.push('white');
    while (pegs.length < CONFIG.CODE_LENGTH) pegs.push('empty');
    return pegs;
});
</script>

<template>
    <div class="guess-row" :class="{ active: isActive }">
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
    display: flex;
    gap: 12px;
    align-items: center;
    transform: scale(0.8);
    transform-origin: center center;
    transition: transform 0.15s ease;
    margin-block: -5px;
    justify-content: center;
}

.guess-row.active {
    border-color: var(--text-primary);
    transform: scale(1);
    margin-block: 8px;
}

.guess-row .guess-number {
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 35px;
    text-align: right;
    font-size: 0.9em;
}

.guess-row .guess-pegs {
    display: flex;
    gap: 8px;
    flex: 0 0 auto;
}

.guess-row .key-pegs {
    margin-left: 20px;
    display: grid;
    grid-template-columns: repeat(2, 23px);
    grid-template-rows: repeat(2, 23px);
    gap: 4px;
    width: 45px;
}

@media (max-width: 480px) {
    .guess-row {
        gap: 8px;
    }

    .guess-row .guess-number {
        min-width: 30px;
        font-size: 0.85em;
    }

    .guess-row .guess-pegs {
        gap: 6px;
    }

    .guess-row .key-pegs {
        gap: 4px;
    }
}

@media (max-width: 380px) {
    .guess-row {
        padding: 8px;
        gap: 6px;
    }
}
</style>
