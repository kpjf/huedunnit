<script setup>
import AppButton from './AppButton.vue';

const commitHash = __COMMIT_HASH__;

const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});

const props = defineProps({
    isAuthenticated: { type: Boolean, default: false },
    completedModes: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['play-daily', 'play-random', 'story', 'login', 'signup', 'logout', 'stats']);
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
                    <AppButton
                        on-dark
                        size="lg"
                        :completed="completedModes.quick"
                        @click="emit('play-daily', 'quick')"
                    >
                        Quick
                    </AppButton>
                    <AppButton
                        on-dark
                        size="lg"
                        :completed="completedModes.classic"
                        @click="emit('play-daily', 'classic')"
                    >
                        Classic
                    </AppButton>
                    <AppButton
                        variant="ghost"
                        size="lg"
                        on-dark
                        @click="emit('play-random', 'quick')"
                    >
                        Random Game
                    </AppButton>
                    <AppButton
                        variant="ghost"
                        size="lg"
                        on-dark
                        @click="emit('story')"
                    >
                        📖 Story Mode
                    </AppButton>
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
                        <AppButton variant="ghost" size="sm" on-dark @click="emit('stats')"
                            >Stats</AppButton
                        >
                        <AppButton variant="ghost" size="sm" on-dark @click="emit('logout')"
                            >Logout</AppButton
                        >
                    </template>
                    <template v-else>
                        <AppButton variant="ghost" size="sm" on-dark @click="emit('login')"
                            >Login</AppButton
                        >
                        <AppButton variant="ghost" size="sm" on-dark @click="emit('signup')"
                            >Sign Up</AppButton
                        >
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
    background-color: #111;
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

.version-hash {
    font-size: 0.7em;
    color: var(--text-secondary);
    opacity: 0.5;
    font-family: monospace;
    margin-bottom: 8px;
}
</style>
