<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import TopMenu from './components/TopMenu.vue';
import SeedSection from './components/SeedSection.vue';
import SeedModal from './components/SeedModal.vue';
import GameStatus from './components/GameStatus.vue';
import SecretCode from './components/SecretCode.vue';
import GameBoard from './components/GameBoard.vue';
import GuessInput from './components/GuessInput.vue';
import IntroScreen from './components/IntroScreen.vue';
import { useGame } from './game/useGame.js';

const {
    currentSeed,
    guesses,
    currentGuess,
    gameOver,
    won,
    secretCode,
    remainingGuesses,
    canSubmit,
    startRandomGame,
    startSeededGame,
    addColor,
    removeColorAt,
    clearGuess,
    submitGuess,
} = useGame();

const screen = ref('intro');
const darkMode = ref(localStorage.getItem('mastermind-darkMode') === 'true');
const showSeedModal = ref(false);

function dailySeed() {
    return new Date().toISOString().slice(0, 10);
}

function handlePlayDaily() {
    startSeededGame(dailySeed());
    screen.value = 'game';
}

function handlePlayRandom() {
    startRandomGame();
    screen.value = 'game';
}

watch(
    darkMode,
    (val) => {
        document.documentElement.classList.toggle('dark-mode', val);
        localStorage.setItem('mastermind-darkMode', String(val));
    },
    { immediate: true },
);

function toggleDarkMode() {
    darkMode.value = !darkMode.value;
}

function handleNewGame() {
    screen.value = 'intro';
}

function handleEnterSeed() {
    showSeedModal.value = true;
}

function handleRandomGame() {
    startRandomGame();
}

function handleSeedConfirm(seed) {
    showSeedModal.value = false;
    startSeededGame(seed);
}

function handleSeedCancel() {
    showSeedModal.value = false;
}

function handleKeydown(e) {
    if (e.key === 'Enter' && !gameOver.value && canSubmit.value) {
        submitGuess();
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <IntroScreen
        v-if="screen === 'intro'"
        @play-daily="handlePlayDaily"
        @play-random="handlePlayRandom"
    />

    <template v-else>
        <TopMenu
            :dark-mode="darkMode"
            @toggle-dark-mode="toggleDarkMode"
            @new-game="handleNewGame"
        />

        <div class="container">
            <main>
                <SecretCode v-if="gameOver" :secret-code="secretCode" />

                <!-- <GameStatus
                    :game-over="gameOver"
                    :won="won"
                    :guess-count="guesses.length"
                    :remaining-guesses="remainingGuesses"
                /> -->

                <GameBoard
                    :guesses="guesses"
                    :current-guess="currentGuess"
                    :game-over="gameOver"
                    @remove-at="removeColorAt"
                />

                <GuessInput
                    v-if="!gameOver"
                    :can-submit="canSubmit"
                    @add-color="addColor"
                    @clear="clearGuess"
                    @submit="submitGuess"
                />
            </main>

            <footer>
                <p>
                    Black peg = correct color, correct position | White peg = correct color, wrong
                    position
                </p>
            </footer>
        </div>

        <SeedModal
            :visible="showSeedModal"
            :initial-seed="currentSeed || ''"
            @confirm="handleSeedConfirm"
            @cancel="handleSeedCancel"
        />
    </template>
</template>

<style scoped>
header {
    text-align: center;
    margin-bottom: 24px;
}

.container {
    height: 100%;
}

.subtitle {
    color: var(--text-secondary);
    font-size: 0.9em;
    font-weight: 400;
    margin-bottom: 18px;
}

main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
}

footer {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.8em;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

@media (max-width: 480px) {
    .subtitle {
        font-size: 0.85em;
    }

    footer {
        font-size: 0.75em;
    }
}

@media (max-width: 380px) {
    .subtitle {
        font-size: 0.8em;
        margin-bottom: 12px;
    }
}
</style>
