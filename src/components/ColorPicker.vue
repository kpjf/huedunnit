<script setup>
import { CONFIG } from '../game/config.js';

defineEmits(['select']);
</script>

<template>
    <div class="color-buttons">
        <button
            v-for="color in CONFIG.COLORS"
            :key="color"
            class="color-btn peg"
            :class="color"
            @click="$emit('select', color)"
        />
    </div>
</template>

<style scoped>
.color-buttons {
    display: flex;
    gap: 4px;
}

.color-btn {
    flex: 1 1 auto;
    aspect-ratio: 1/1;
    width: 50px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
    margin: 0 auto;
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

@media (max-width: 480px) {
    .color-btn {
        width: 45px;
        height: 45px;
    }
}

@media (max-width: 380px) {
    .color-btn {
        width: 40px;
        height: 40px;
    }
}
</style>
