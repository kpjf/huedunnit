<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TopMenu from '../components/TopMenu.vue';
import SeedModal from '../components/SeedModal.vue';
import GameBoard from '../components/GameBoard.vue';
import GuessInput from '../components/GuessInput.vue';
import ConfettiCanvas from '../components/ConfettiCanvas.vue';
import OutroScreen from '../components/OutroScreen.vue';
import StatsScreen from '../components/StatsScreen.vue';
import { useGame } from '../game/useGame.js';
import { useHaptics } from '../composables/useHaptics.js';
import { saveDailyState, loadDailyState } from '../game/useDailyStorage.js';
import { recordResult, loadStats, checkAndExpireStreak } from '../game/useStats.js';
import { useStatsStore } from '../stores/stats.js';
import AppButton from '../components/AppButton.vue';

const { celebrate } = useHaptics();

const elapsedSeconds = ref(0);
let timerInterval = null;

function startTimer() {
    elapsedSeconds.value = 0;
    timerInterval = setInterval(() => {
        elapsedSeconds.value++;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

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

const router = useRouter();
const route = useRoute();
const statsStore = useStatsStore();
const screen = ref('game');
const animateBoard = ref(false);
const darkMode = ref(localStorage.getItem('mastermind-darkMode') !== 'false');
const showSeedModal = ref(false);
const showConfetti = ref(false);
const currentMode = ref('classic');
const currentStats = ref(null);

watch(won, (val) => {
    if (val && screen.value === 'game') {
        showConfetti.value = true;
        celebrate();
    }
});

watch(gameOver, (val) => {
    if (val) {
        stopTimer();
        if (currentSeed.value === dailySeed()) {
            recordResult(
                currentSeed.value,
                currentMode.value,
                won.value,
                guesses.value.length,
                elapsedSeconds.value,
            );
            currentStats.value = loadStats(currentMode.value);
            statsStore.pushStats();
        }
        if (!won.value && screen.value === 'game') screen.value = 'outro';
    }
});

function handleConfettiDone() {
    showConfetti.value = false;
    if (screen.value === 'game') screen.value = 'outro';
}

function dailySeed() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function handlePlayDaily(mode) {
    currentMode.value = mode;
    const date = dailySeed();
    checkAndExpireStreak(date, mode);
    const saved = loadDailyState(date, mode);
    if (saved) {
        restoreGame(date, mode, saved);
        if (saved.gameOver) {
            const stats = loadStats(mode);
            currentStats.value = stats;
            const statEntry = stats.dailies?.find((d) => d.date === date);
            const duration = saved.elapsedSeconds || statEntry?.durationSeconds || 0;
            elapsedSeconds.value = duration;
            animateBoard.value = true;
            screen.value = 'review';
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
        if (currentSeed.value === dailySeed() && !screen.value.startsWith('review')) {
            saveDailyState(dailySeed(), currentMode.value, {
                guesses: guesses.value,
                gameOver: gameOver.value,
                won: won.value,
                elapsedSeconds: elapsedSeconds.value,
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
    router.push('/');
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
    const { type, mode } = route.query;
    if (type === 'random') {
        handlePlayRandom(mode || 'classic');
    } else {
        handlePlayDaily(mode || 'classic');
    }
    if (!gameOver.value) startTimer();
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    stopTimer();
});
</script>

<template>
    <Screen
        v-if="screen === 'outro'"
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
        @review="screen = 'review'"
    />

    <StatsScreen
        v-else-if="screen === 'stats'"
        :stats="currentStats"
        :max-guesses="gameConfig.MAX_GUESSES"
        :won="won"
        :guess-count="guesses.length"
        @close="screen = 'review'"
    />

    <template v-else>
        <TopMenu
            :dark-mode="darkMode"
            :timer="!gameOver || screen === 'review' ? formatTime(elapsedSeconds) : null"
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
                    :animate-rows="animateBoard"
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

                <div v-if="screen === 'review'" class="review-bar">
                    <AppButton
                        variant="ghost"
                        :disabled="!currentStats"
                        :title="currentStats ? undefined : 'Play a daily puzzle to track stats'"
                        @click="screen = 'stats'"
                    >
                        View Results
                    </AppButton>
                </div>
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

.review-bar {
    display: flex;
    gap: 10px;
    padding: 14px 18px;
    justify-content: center;
    flex-shrink: 0;
}

.review-bar-btn {
    flex: 1;
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
