<script setup>
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    defineEmits(['play-daily', 'play-random']);
</script>

<template>
    <div class="intro-container">
        <div class="intro-card">
            <div class="intro-logo">
                <slot name="logo">
                    <div class="logo-placeholder" />
                </slot>
            </div>

            <h1 class="intro-title">
                Mastermind
            </h1>
            <p class="intro-description">
                Break the secret code. A new puzzle every day.
            </p>

            <div class="intro-puzzle-date">
                <span class="date-label">Today's Puzzle</span>
                <span class="date-value">{{ today }}</span>
            </div>

            <div class="intro-actions">
                <button
                    class="btn btn-primary intro-btn"
                    @click="$emit('play-daily')"
                >
                    Play Today's Puzzle
                </button>
                <button
                    class="btn btn-secondary intro-btn"
                    @click="$emit('play-random')"
                >
                    Random Game
                </button>
            </div>

            <div class="intro-account">
                <button
                    class="btn btn-ghost"
                    disabled
                >
                    Login
                </button>
                <button
                    class="btn btn-ghost"
                    disabled
                >
                    Subscribe
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.intro-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}

.intro-card {
    background: var(--bg-primary);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    padding: 40px 32px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    animation: slideIn 0.3s ease-out;
}

.intro-logo {
    margin-bottom: 24px;
}

.logo-placeholder {
    width: 80px;
    height: 80px;
    background: var(--bg-secondary);
    border: 2px dashed var(--border-color);
    margin: 0 auto;
}

.intro-title {
    font-size: 2em;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.intro-description {
    color: var(--text-secondary);
    font-size: 0.95em;
    margin-bottom: 28px;
}

.intro-puzzle-date {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 12px 16px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.date-label {
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
}

.date-value {
    font-size: 0.95em;
    font-weight: 600;
    color: var(--text-primary);
}

.intro-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
}

.intro-btn {
    width: 100%;
    padding: 13px 20px;
    font-size: 1em;
}

.intro-account {
    display: flex;
    gap: 10px;
    justify-content: center;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

.btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    padding: 8px 20px;
    font-size: 0.88em;
    font-weight: 600;
    cursor: not-allowed;
    opacity: 0.6;
    flex: 1;
}
</style>
