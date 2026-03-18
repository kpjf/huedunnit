<script setup>
    import { computed } from 'vue';
    import AppButton from './AppButton.vue';

    const props = defineProps({
        currentSeed: {
            type: String,
            default: null,
        },
    });

    defineEmits(['enter-seed', 'random-game']);

    const seedText = computed(() => {
        return props.currentSeed ? `Seed: ${props.currentSeed}` : 'No seed - each game is random';
    });

    const seedActive = computed(() => !!props.currentSeed);
</script>

<template>
    <div class="seed-section">
        <div
            class="seed-display"
            :class="{ active: seedActive }"
        >
            {{ seedText }}
        </div>
        <div class="seed-input-group">
            <AppButton class="seed-btn" @click="$emit('enter-seed')">Enter Seed Phrase</AppButton>
            <AppButton variant="secondary" class="seed-btn" @click="$emit('random-game')">Random Game</AppButton>
        </div>
        <p class="seed-hint">
            Click "Enter Seed Phrase" to create a reproducible game, or "Random Game" for a new challenge
        </p>
    </div>
</template>

<style scoped>
.seed-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

.seed-display {
    background: var(--bg-secondary);
    padding: 12px;
    margin-bottom: 12px;
    font-size: 0.9em;
    color: var(--text-secondary);
    text-align: center;
    border: 1px solid var(--border-color);
    min-height: 20px;
}

.seed-display.active {
    color: var(--text-primary);
    background: var(--bg-tertiary);
    border-color: var(--text-primary);
    font-weight: 600;
}

.seed-input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.seed-btn {
    flex: 1;
}

.seed-hint {
    font-size: 0.75em;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 400;
}

@media (max-width: 480px) {
    .seed-input-group {
        flex-direction: column;
        gap: 8px;
    }

    .btn-seed {
        width: 100%;
    }

    .seed-hint {
        font-size: 0.7em;
    }
}

@media (max-width: 380px) {
    .seed-section {
        padding-top: 12px;
        margin-top: 12px;
    }

    .seed-hint {
        font-size: 0.65em;
    }
}
</style>
