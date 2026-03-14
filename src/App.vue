<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import TopMenu from './components/TopMenu.vue';
import SeedModal from './components/SeedModal.vue';
import GameBoard from './components/GameBoard.vue';
import GuessInput from './components/GuessInput.vue';
import IntroScreen from './components/IntroScreen.vue';
import ConfettiCanvas from './components/ConfettiCanvas.vue';
import OutroScreen from './components/OutroScreen.vue';
import StatsScreen from './components/StatsScreen.vue';
import { useGame } from './game/useGame.js';
import { saveDailyState, loadDailyState } from './game/useDailyStorage.js';
import { recordResult, loadStats } from './game/useStats.js';

const {
    currentSeed,
    gameConfig,
    guesses,
    currentGuess,
    gameOver,
    won,
    secretCode,
    canSubmit,
    startRandomGame,
    startSeededGame,
    restoreGame,
    addColor,
    removeColorAt,
    clearGuess,
    submitGuess,
} = useGame();

const screen = ref('intro');
const darkMode = ref(localStorage.getItem('mastermind-darkMode') === 'true');
const showSeedModal = ref(false);
const showConfetti = ref(false);
const currentMode = ref('classic');
const currentStats = ref(null);

watch(won, (val) => {
    if (val && screen.value === 'game') showConfetti.value = true;
});

watch(gameOver, (val) => {
    if (val) {
        if (currentSeed.value === dailySeed()) {
            recordResult(currentSeed.value, currentMode.value, won.value, guesses.value.length);
            currentStats.value = loadStats(currentMode.value);
        }
        if (!won.value) screen.value = 'outro';
    }
});

function handleConfettiDone() {
    showConfetti.value = false;
    if (screen.value === 'game') screen.value = 'outro';
}

function dailySeed() {
    return new Date().toISOString().slice(0, 10);
}

function handlePlayDaily(mode) {
    currentMode.value = mode;
    const date = dailySeed();
    const saved = loadDailyState(date, mode);
    if (saved) {
        restoreGame(date, mode, saved);
        if (saved.gameOver) {
            currentStats.value = loadStats(mode);
            screen.value = 'outro';
        } else {
            screen.value = 'game';
        }
    } else {
        startSeededGame(date, mode);
        screen.value = 'game';
    }
}

watch(
    guesses,
    () => {
        if (currentSeed.value === dailySeed()) {
            saveDailyState(dailySeed(), currentMode.value, {
                guesses: guesses.value,
                gameOver: gameOver.value,
                won: won.value,
            });
        }
    },
    { deep: true },
);

function handlePlayRandom(mode) {
    startRandomGame(mode);
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

    <OutroScreen
        v-else-if="screen === 'outro'"
        :won="won"
        :guess-count="guesses.length"
        :guesses="guesses"
        :secret-code="secretCode"
        :seed="currentSeed"
        :max-guesses="gameConfig.MAX_GUESSES"
        :code-length="gameConfig.CODE_LENGTH"
        :stats="currentStats"
        @play-again="handleNewGame"
        @show-stats="screen = 'stats'"
    />

    <StatsScreen
        v-else-if="screen === 'stats'"
        :stats="currentStats"
        :max-guesses="gameConfig.MAX_GUESSES"
        :won="won"
        :guess-count="guesses.length"
        @close="screen = 'outro'"
    />

    <template v-else>
        <TopMenu
            :dark-mode="darkMode"
            @toggle-dark-mode="toggleDarkMode"
            @new-game="handleNewGame"
        />

        <div class="container">
            <main>
                <GameBoard
                    :guesses="guesses"
                    :current-guess="currentGuess"
                    :game-over="gameOver"
                    :max-guesses="gameConfig.MAX_GUESSES"
                    :code-length="gameConfig.CODE_LENGTH"
                    @remove-at="removeColorAt"
                />

                <GuessInput
                    v-if="!gameOver"
                    :can-submit="canSubmit"
                    :colors="gameConfig.COLORS"
                    @add-color="addColor"
                    @clear="clearGuess"
                    @submit="submitGuess"
                />
            </main>
        </div>

        <SeedModal
            :visible="showSeedModal"
            :initial-seed="currentSeed || ''"
            @confirm="handleSeedConfirm"
            @cancel="handleSeedCancel"
        />
    </template>

    <ConfettiCanvas v-if="showConfetti" @done="handleConfettiDone" />
</template>

<style scoped>
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
    footer {
        font-size: 0.75em;
    }
}
</style>
