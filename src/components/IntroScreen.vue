<script setup>
const commitHash = __COMMIT_HASH__;

const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});

const props = defineProps({
    isAuthenticated: { type: Boolean, default: false },
    completedModes: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['play-daily', 'play-random', 'login', 'signup', 'logout', 'stats']);
</script>

<template>
    <div class="intro-container">
        <div class="intro-card">
            <main>
                <div class="intro-logo">
                    <slot name="logo">
                        <img src="/images/logo.svg" />
                    </slot>
                </div>

                <h1 class="intro-title">HEXCode</h1>
                <p class="intro-description">Break the secret code. A new puzzle every day.</p>

                <div class="mode-toggle">
                    <button class="mode-btn" :class="{ completed: completedModes.quick }" @click="emit('play-daily', 'quick')">Quick</button>
                    <button class="mode-btn" :class="{ completed: completedModes.classic }" @click="emit('play-daily', 'classic')">Classic</button>
                </div>

                <div class="intro-puzzle-date">
                    <span class="date-value">{{ today }}</span>
                </div>
            </main>

            <footer>
                <!-- <div class="intro-actions">
                    <button class="btn btn-primary intro-btn" @click="emit('play-daily', mode)">
                        Play Today's Puzzle
                    </button>
                    <button class="btn btn-secondary intro-btn" @click="emit('play-random', mode)">
                        Random Game
                    </button>
                </div> -->

                <div class="intro-account">
                    <template v-if="props.isAuthenticated">
                        <button class="btn btn-ghost" @click="emit('stats')">Stats</button>
                        <button class="btn btn-ghost" @click="emit('logout')">Logout</button>
                    </template>
                    <template v-else>
                        <button class="btn btn-ghost" @click="emit('login')">Login</button>
                        <button class="btn btn-ghost" @click="emit('signup')">Sign Up</button>
                    </template>
                </div>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.intro-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #213a8f;
}

.intro-card {
    max-width: 400px;
    width: 100%;
    text-align: center;
    animation: slideIn 0.3s ease-out;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    main {
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    footer {
        flex: 0 o 100%;
        width: 100%;
        padding: 1rem;
        display: flex;
        justify-content: center;
        align-content: center;
        gap: 0.5rem;
        flex-direction: column;
    }
}

.intro-logo {
    margin: 0 auto 12px auto !important;
    width: 90px;
    margin: auto;
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
    color: #fff;
    margin-bottom: 8px;
}

.intro-description {
    color: #fff;
    font-size: 1.2rem;
    max-width: 25ch;
    margin: 0 auto 20px auto;
}

.mode-toggle {
    display: flex;
    margin-bottom: 10px;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex-direction: column;
}

.mode-btn {
    flex: 1;
    font-size: 1rem;
    font-weight: 600;
    background: #fff;
    border: none;
    border-radius: 100px;
    width: 200px;
    color: #000;
    cursor: pointer;
    transition: all 0.15s;
    padding: 12px 20px;
}

.mode-btn.completed {
    opacity: 0.5;
}

.mode-btn.active {
    background: var(--bg-primary);
    color: var(--text-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mode-description {
    font-size: 0.8em;
    color: var(--text-secondary);
    margin-bottom: 20px;
    letter-spacing: 0.02em;
}

.intro-puzzle-date {
    background: transparent;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.date-label {
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #fff;
}

.date-value {
    font-size: 0.95em;
    font-weight: 600;
    color: #fff;
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
}

.btn-ghost {
    background: transparent;
    color: #fff;
    border: 1px solid #fff;
    padding: 8px 20px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    flex: 1;
    border-radius: 40px;
    width: auto;
    flex: 0 0 auto;
}

.btn-ghost:hover {
    color: var(--text-primary);
    border-color: var(--text-secondary);
}

.version-hash {
    font-size: 0.7em;
    color: var(--text-secondary);
    opacity: 0.5;
    font-family: monospace;
    margin-bottom: 8px;
}
</style>
