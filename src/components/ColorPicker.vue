<script setup>
import { useHaptics } from '../composables/useHaptics.js';

defineProps({
    colors: { type: Array, required: true },
});

const emit = defineEmits(['select']);
const { tapColor } = useHaptics();

const KEY_HINTS = {
    red: 'R',
    blue: 'B',
    yellow: 'Y',
    green: 'G',
    purple: 'P',
    orange: 'O',
    cyan: 'C',
    pink: 'K',
};

function handleSelect(color) {
    tapColor();
    emit('select', color);
}
</script>

<template>
    <div class="color-buttons">
        <button
            v-for="color in colors"
            :key="color"
            class="color-btn peg"
            :class="color"
            @click="handleSelect(color)"
        >
            <span v-if="KEY_HINTS[color]" class="key-hint">{{ KEY_HINTS[color] }}</span>
        </button>
    </div>
</template>

<style scoped>
.color-buttons {
    display: flex;
    gap: 4px;
    justify-content: center;
}

.color-btn {
    flex: 1 1 0;
    min-width: 0;
    max-width: 50px;
    aspect-ratio: 1;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
    position: relative;
}

.color-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.color-btn.selected {
    border-color: var(--text-primary);
    box-shadow:
        0 0 0 2px var(--bg-primary),
        0 0 0 4px var(--text-primary);
}

.key-hint {
    position: absolute;
    bottom: 2px;
    right: 3px;
    font-size: 0.55em;
    font-weight: 700;
    line-height: 1;
    color: rgba(255, 255, 255, 0.75);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    pointer-events: none;
    letter-spacing: 0;
}
</style>
