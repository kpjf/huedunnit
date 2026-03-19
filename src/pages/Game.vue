<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TopMenu from '../components/TopMenu.vue';
import SeedModal from '../components/SeedModal.vue';
import GameBoard from '../components/GameBoard.vue';
import GuessInput from '../components/GuessInput.vue';
import ConfettiCanvas from '../components/ConfettiCanvas.vue';
import OutroScreen from '../components/OutroScreen.vue';
import StatsScreen from '../components/StatsScreen.vue';
import AppButton from '../components/AppButton.vue';
import { useGame } from '../game/useGame.js';
import { useHaptics } from '../composables/useHaptics.js';
import { saveDailyState, loadDailyState } from '../game/useDailyStorage.js';
import { recordResult, loadStats, checkAndExpireStreak } from '../game/useStats.js';
import { useStatsStore } from '../stores/stats.js';
import { useStoryMode } from '../game/useStoryMode.js';
import { STORY_LEVELS } from '../game/storyLevels.js';

const { celebrate } = useHaptics();

// ── Timer ──────────────────────────────────────────────────────────────────
const elapsedSeconds = ref(0);
let timerInterval = null;

function startTimer() {
    elapsedSeconds.value = 0;
    timerInterval = setInterval(() => { elapsedSeconds.value++; }, 1000);
}

function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Game core ──────────────────────────────────────────────────────────────
const {
    currentSeed, gameConfig, guesses, currentGuess, gameOver, won, secretCode,
    canSubmit, startRandomGame, startSeededGame, startStoryLevel, restoreGame,
    addColor, removeColorAt, clearGuess, submitGuess,
} = useGame();

const router = useRouter();
const route = useRoute();
const statsStore = useStatsStore();
const { completeLevel, useAttempt, awardCoins } = useStoryMode();

const screen = ref('game');
const animateBoard = ref(false);
const darkMode = ref(localStorage.getItem('mastermind-darkMode') !== 'false');
const showSeedModal = ref(false);
const showConfetti = ref(false);
const currentMode = ref('classic');
const currentStats = ref(null);

// ── Story mode state ───────────────────────────────────────────────────────
const isStoryMode = computed(() => route.query.type === 'story');
const storyLevelId = computed(() => isStoryMode.value ? Number(route.query.level) : null);
const storyLevel = computed(() =>
    storyLevelId.value ? STORY_LEVELS.find((l) => l.id === storyLevelId.value) ?? null : null,
);
const storyResult = ref(null); // { coinsEarned, stars } after completion

// ── Watchers ───────────────────────────────────────────────────────────────
watch(won, (val) => {
    if (val && screen.value === 'game') {
        showConfetti.value = true;
        celebrate();
    }
});

watch(gameOver, (val) => {
    if (!val) return;
    stopTimer();

    if (isStoryMode.value && storyLevel.value) {
        if (won.value) {
            const result = completeLevel(
                storyLevel.value.id,
                guesses.value.length,
                storyLevel.value.config.maxGuesses,
                elapsedSeconds.value,
                0,
            );
            storyResult.value = result;
        }
        if (!won.value && screen.value === 'game') screen.value = 'outro';
    } else {
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

            // Award coins for daily wins
            if (won.value) {
                const coinAmount = currentMode.value === 'classic' ? 10 : 5;
                awardCoins(coinAmount);
            }
        } else if (won.value) {
            // Random game win
            awardCoins(3);
        }
        if (!won.value && screen.value === 'game') screen.value = 'outro';
    }
});

watch(
    guesses,
    () => {
        if (!isStoryMode.value && currentSeed.value === dailySeed() && !screen.value.startsWith('review')) {
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

watch(
    darkMode,
    (val) => {
        document.documentElement.classList.toggle('dark-mode', val);
        localStorage.setItem('mastermind-darkMode', String(val));
    },
    { immediate: true },
);

// ── Helpers ────────────────────────────────────────────────────────────────
function dailySeed() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function handleConfettiDone() {
    showConfetti.value = false;
    if (screen.value === 'game') screen.value = 'outro';
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

function handlePlayRandom(mode) {
    startRandomGame(mode);
    screen.value = 'game';
}

function handlePlayStory(levelId) {
    const level = STORY_LEVELS.find((l) => l.id === levelId);
    if (!level) { router.push('/story'); return; }
    useAttempt(levelId);
    startStoryLevel(level.config, level.seed);
    screen.value = 'game';
}

function handleNewGame() {
    if (isStoryMode.value) {
        router.push('/story');
    } else {
        router.push('/');
    }
}

function handleNextStoryLevel() {
    const nextId = storyLevelId.value + 1;
    const next = STORY_LEVELS.find((l) => l.id === nextId);
    if (next) {
        router.push({ path: '/game', query: { type: 'story', level: nextId } });
    } else {
        router.push('/story');
    }
}

function handleSeedConfirm(seed) {
    showSeedModal.value = false;
    startSeededGame(seed);
}

function handleSeedCancel() { showSeedModal.value = false; }

function toggleDarkMode() { darkMode.value = !darkMode.value; }

function handleKeydown(e) {
    if (e.key === 'Enter' && !gameOver.value && canSubmit.value) submitGuess();
}

// ── Mount ──────────────────────────────────────────────────────────────────
onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
    const { type, mode, level } = route.query;
    if (type === 'story') {
        handlePlayStory(Number(level));
    } else if (type === 'random') {
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
    <OutroScreen
        v-if="screen === 'outro'"
        :won="won"
        :guess-count="guesses.length"
        :guesses="guesses"
        :secret-code="secretCode"
        :seed="isStoryMode ? null : currentSeed"
        :max-guesses="gameConfig.MAX_GUESSES"
        :code-length="gameConfig.CODE_LENGTH"
        :stats="currentStats"
        :story-level="storyLevel"
        :story-result="storyResult"
        :next-story-level-available="isStoryMode && storyLevelId < 50"
        @play-again="handleNewGame"
        @show-stats="screen = 'stats'"
        @review="screen = 'review'"
        @next-story-level="handleNextStoryLevel"
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
                <!-- Story level header -->
                <div v-if="isStoryMode && storyLevel" class="story-level-bar">
                    <span class="story-level-label">Level {{ storyLevel.id }}</span>
                    <span class="story-level-title">{{ storyLevel.title }}</span>
                </div>

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

.story-level-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px 0;
    flex-shrink: 0;
}

.story-level-label {
    font-size: 0.75em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: 3px 10px;
    border-radius: 100px;
    border: 1px solid var(--border-color);
}

.story-level-title {
    font-size: 0.9em;
    font-weight: 600;
    color: var(--text-primary);
}

.review-bar {
    display: flex;
    gap: 10px;
    padding: 14px 18px;
    justify-content: center;
    flex-shrink: 0;
}

@media (max-width: 480px) {
    footer { font-size: 0.75em; }
}
</style>
