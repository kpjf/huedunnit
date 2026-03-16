<script setup>
import ColorPicker from './ColorPicker.vue';
import { useHaptics } from '../composables/useHaptics.js';

defineProps({
    canSubmit: { type: Boolean, required: true },
    colors: { type: Array, required: true },
});

const emit = defineEmits(['add-color', 'clear', 'submit']);
const { tapSubmit, tapClear } = useHaptics();

function handleSubmit() {
    tapSubmit();
    emit('submit');
}

function handleClear() {
    tapClear();
    emit('clear');
}
</script>

<template>
    <div class="input-section">
        <div class="color-selector">
            <ColorPicker :colors="colors" @select="emit('add-color', $event)" />
        </div>
        <div class="actions">
            <button class="btn btn-primary" :disabled="!canSubmit" @click="handleSubmit">
                Submit Guess
            </button>
            <button class="btn btn-secondary" @click="handleClear">Clear</button>
        </div>
    </div>
</template>

<style scoped>
.input-section {
    padding: 18px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 16px;
}

.color-selector {
    flex: 1;
}

.actions {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
}

@media (max-width: 480px) {
    .input-section {
        padding: 14px;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .actions {
        justify-content: flex-end;
    }
}
</style>
