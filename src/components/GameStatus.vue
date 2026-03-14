<script setup>
    import { computed } from "vue";

    const props = defineProps({
        gameOver: {
            type: Boolean,
            required: true,
        },
        won: {
            type: Boolean,
            required: true,
        },
        guessCount: {
            type: Number,
            required: true,
        },
        remainingGuesses: {
            type: Number,
            required: true,
        },
    });

    const statusClass = computed(() => {
        if (props.won) return "game-status won";
        if (props.gameOver) return "game-status lost";
        return "game-status active";
    });

    const statusText = computed(() => {
        if (props.won) {
            const s = props.guessCount === 1 ? "" : "es";
            return `🎉 You Won! Solved in ${props.guessCount} guess${s}`;
        }
        if (props.gameOver) {
            return "💔 Game Over! You did not find the code.";
        }
        return `Guesses remaining: ${props.remainingGuesses} / 10`;
    });
</script>

<template>
    <div :class="statusClass">
        {{ statusText }}
    </div>
</template>

<style scoped>
.game-status {
    text-align: center;
    padding: 14px;
    margin-bottom: 20px;
    font-weight: 600;
    font-size: 1em;
    min-height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.game-status.active {
    background: #e8f4f8;
    color: #1565a0;
}

:global(html.dark-mode) .game-status.active {
    background: #1e4d63;
    color: #90caf9;
}

.game-status.won {
    background: #e8f5e9;
    color: #2e7d32;
}

:global(html.dark-mode) .game-status.won {
    background: #1b5e20;
    color: #81c784;
}

.game-status.lost {
    background: #ffebee;
    color: #c62828;
}

:global(html.dark-mode) .game-status.lost {
    background: #5a1f1a;
    color: #ef5350;
}

@media (max-width: 380px) {
    .game-status {
        font-size: 0.9em;
        padding: 12px;
        min-height: 40px;
    }
}
</style>
