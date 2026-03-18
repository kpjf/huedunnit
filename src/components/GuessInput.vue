<script setup>
import ColorPicker from './ColorPicker.vue';
import AppButton from './AppButton.vue';
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
            <AppButton :disabled="!canSubmit" @click="handleSubmit">Submit Guess</AppButton>
            <AppButton variant="secondary" @click="handleClear">Clear</AppButton>
        </div>
    </div>
</template>

<style scoped>
.input-section {
    padding: 18px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.color-selector {
    width: 100%;
}

.actions {
    display: flex;
    gap: 10px;
    justify-content: center;
}

@media (max-width: 480px) {
    .input-section {
        padding: 14px;
    }
}
</style>
