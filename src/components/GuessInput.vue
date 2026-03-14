<script setup>
import ColorPicker from './ColorPicker.vue';

defineProps({
    canSubmit: { type: Boolean, required: true },
    colors: { type: Array, required: true },
});

const emit = defineEmits(['add-color', 'clear', 'submit']);
</script>

<template>
    <div class="input-section">
        <div class="color-selector">
            <ColorPicker :colors="colors" @select="emit('add-color', $event)" />
        </div>
        <div class="actions">
            <button class="btn btn-primary" :disabled="!canSubmit" @click="emit('submit')">
                Submit Guess
            </button>
            <button class="btn btn-secondary" @click="emit('clear')">Clear</button>
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
