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
import ShareModal from '../components/ShareModal.vue';
import HowToPlayModal from '../components/HowToPlayModal.vue';
import { useGame } from '../game/useGame.js';
import { useHaptics } from '../composables/useHaptics.js';
import { saveDailyState, loadDailyState } from '../game/useDailyStorage.js';
import { recordResult, loadStats, checkAndExpireStreak } from '../game/useStats.js';
import { useStatsStore } from '../stores/stats.js';
import { useAuthStore } from '../stores/auth.js';
import { useStoryMode } from '../game/useStoryMode.js';
import { STORY_LEVELS } from '../game/storyLevels.js';
import { useShareImage } from '../composables/useShareImage.js';
import { dailySeed } from '../utils/date.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useGameTimer } from '../composables/useGameTimer.js';
import { useKeyboardInput } from '../composables/useKeyboardInput.js';

const { celebrate } = useHaptics();
const { shareResults, shareReview } = useShareImage();

// ── Timer ──────────────────────────────────────────────────────────────────
const { elapsedSeconds, formattedTime, startTimer, stopTimer, resetTo } = useGameTimer();

// ── Game core ──────────────────────────────────────────────────────────────
const {
    currentSeed, gameConfig, guesses, currentGuess, gameOver, won, secretCode,
    canSubmit, startRandomGame, startSeededGame, startStoryLevel, restoreGame,
    addColor, removeColorAt, setColorAt, clearGuess, submitGuess,
} = useGame();

const selectedPegIndex = ref(null);

function nextEmptySlot(afterIndex) {
    const guess = currentGuess.value;
    const len = gameConfig.value.CODE_LENGTH;
    for (let i = afterIndex + 1; i < len; i++) {
        if (i >= guess.length || guess[i] == null) return i;
    }
    for (let i = 0; i < afterIndex; i++) {
        if (i >= guess.length || guess[i] == null) return i;
    }
    return null;
}

function handleAddColor(color) {
    if (selectedPegIndex.value !== null) {
        setColorAt(selectedPegIndex.value, color);
        selectedPegIndex.value = nextEmptySlot(selectedPegIndex.value);
    } else {
        addColor(color);
    }
}

function handleRemoveAt(index) {
    removeColorAt(index);
    selectedPegIndex.value = index;
}

function handleSelectSlot(index) {
    selectedPegIndex.value = selectedPegIndex.value === index ? null : index;
}

function handleClearGuess() {
    clearGuess();
    selectedPegIndex.value = null;
}

function handleSubmitGuess() {
    submitGuess();
    selectedPegIndex.value = null;
}

const router = useRouter();
const route = useRoute();
const statsStore = useStatsStore();
const authStore = useAuthStore();
const { completeLevel, useAttempt, awardCoins } = useStoryMode();

const screen = ref('game');
const animateBoard = ref(false);
const { theme, isDark: darkMode, toggleDarkMode } = useDarkMode();
const showSeedModal = ref(false);
const showShareModal = ref(false);
const showHowToPlay = ref(false);
const showConfetti = ref(false);
const currentMode = ref('classic');
const currentStats = ref(null);
// Used when the daily was completed on another device (no local state, but server confirms)
const syntheticResult = ref(null);
const effectiveWon = computed(() => syntheticResult.value !== null ? syntheticResult.value.won : won.value);
const effectiveGuessCount = computed(() => syntheticResult.value !== null ? syntheticResult.value.guessCount : guesses.value.length);

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
            const isNewResult = recordResult(
                currentSeed.value,
                currentMode.value,
                won.value,
                guesses.value.length,
                elapsedSeconds.value,
                secretCode.value,
                guesses.value,
            );
            currentStats.value = loadStats(currentMode.value);
            statsStore.pushStats();

            // Award coins for daily wins — only on first completion
            if (won.value && isNewResult) {
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

// ── Helpers ────────────────────────────────────────────────────────────────
function handleConfettiDone() {
    showConfetti.value = false;
    if (screen.value === 'game') screen.value = 'outro';
}

async function handlePlayDaily(mode) {
    currentMode.value = mode;
    const date = dailySeed();
    checkAndExpireStreak(date, mode);

    // Fetch server stats upfront if not already loaded — needed to detect
    // cross-device completions regardless of local state
    if (authStore.isAuthenticated && statsStore.stats === null) {
        await statsStore.fetchStats();
    }

    const saved = loadDailyState(date, mode);
    const serverStats = statsStore.stats?.[mode];
    const completedOnServer = serverStats?.lastRecordedDate === date;

    if (saved?.gameOver) {
        // Local completed state takes priority
        restoreGame(date, mode, saved);
        const stats = loadStats(mode);
        currentStats.value = stats;
        const statEntry = stats.dailies?.find((d) => d.date === date);
        const duration = saved.elapsedSeconds || statEntry?.durationSeconds || 0;
        resetTo(duration);
        animateBoard.value = true;
        screen.value = 'review';
    } else if (completedOnServer) {
        // Completed on another device — restore from server data
        const todayEntries = serverStats.dailies?.filter(d => d.date === date) ?? [];
        const serverEntry = todayEntries.slice().reverse().find(d => d.guesses?.length > 0)
            ?? todayEntries[todayEntries.length - 1];

        if (serverEntry?.guesses?.length > 0) {
            restoreGame(date, mode, { guesses: serverEntry.guesses });
            currentStats.value = loadStats(mode);
            resetTo(serverEntry.durationSeconds ?? 0);
            animateBoard.value = true;
            screen.value = 'review';
        } else {
            // Partial data only (no guesses saved) — show outro with what we have
            startSeededGame(date, mode);
            currentStats.value = loadStats(mode);
            syntheticResult.value = {
                won: serverStats.lastWonDate === date,
                guessCount: serverEntry?.guessCount ?? 0,
            };
            resetTo(serverEntry?.durationSeconds ?? 0);
            screen.value = 'outro';
        }
    } else if (saved) {
        // In-progress local game
        restoreGame(date, mode, saved);
        screen.value = 'game';
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
    startStoryLevel(level.config, null); // null = random code each attempt; config is fixed
    storyResult.value = null;
    showConfetti.value = false;
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

// Re-init when navigating to a different story level (same route, new query params)
watch(
    () => route.query.level,
    (newLevel, oldLevel) => {
        if (newLevel && oldLevel && newLevel !== oldLevel && route.query.type === 'story') {
            stopTimer();
            handlePlayStory(Number(newLevel));
            startTimer();
        }
    },
);

function handleSeedConfirm(seed) {
    showSeedModal.value = false;
    startSeededGame(seed);
}

function handleSeedCancel() { showSeedModal.value = false; }

function shareOpts() {
    return {
        guesses: guesses.value,
        codeLength: gameConfig.value.CODE_LENGTH,
        maxGuesses: gameConfig.value.MAX_GUESSES,
        isDaily: currentSeed.value === dailySeed(),
        elapsedSeconds: elapsedSeconds.value,
    };
}

function handleSharePattern() {
    showShareModal.value = false;
    shareResults(shareOpts());
}

function handleShareFull() {
    showShareModal.value = false;
    shareReview(shareOpts());
}

useKeyboardInput({
    isActive: computed(() => !gameOver.value),
    availableColors: computed(() => gameConfig.value.COLORS),
    canSubmit,
    onColorKey: handleAddColor,
    onSubmit: handleSubmitGuess,
    onRemove: () => { if (selectedPegIndex.value !== null) handleRemoveAt(selectedPegIndex.value); },
    onNavigate: (dir) => {
        const len = gameConfig.value.CODE_LENGTH;
        if (dir === 'right') {
            selectedPegIndex.value = selectedPegIndex.value === null ? 0 : (selectedPegIndex.value + 1) % len;
        } else {
            selectedPegIndex.value = selectedPegIndex.value === null ? len - 1 : ((selectedPegIndex.value - 1) + len) % len;
        }
    },
    onEscape: () => { selectedPegIndex.value = null; },
});

// ── Mount ──────────────────────────────────────────────────────────────────
onMounted(async () => {
    const { type, mode, level } = route.query;
    if (type === 'story') {
        handlePlayStory(Number(level));
    } else if (type === 'random') {
        handlePlayRandom(mode || 'classic');
    } else {
        await handlePlayDaily(mode || 'classic');
    }
    if (!gameOver.value && screen.value === 'game') startTimer();
    if (!localStorage.getItem('hexcode_htp_seen')) showHowToPlay.value = true;
});

onUnmounted(() => {
    stopTimer();
});
</script>

<template>
    <OutroScreen
        v-if="screen === 'outro'"
        :won="effectiveWon"
        :guess-count="effectiveGuessCount"
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
        :won="effectiveWon"
        :guess-count="effectiveGuessCount"
        @close="screen = 'review'"
    />

    <template v-else>
        <TopMenu
            :theme="theme"
            :timer="!gameOver || screen === 'review' ? formattedTime : null"
            :show-share="screen === 'review'"
            @toggle-dark-mode="toggleDarkMode"
            @new-game="handleNewGame"
            @share="showShareModal = true"
            @how-to-play="showHowToPlay = true"
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
                    :selected-peg-index="selectedPegIndex"
                    @remove-at="handleRemoveAt"
                    @select-slot="handleSelectSlot"
                />

                <GuessInput
                    v-if="!gameOver"
                    :can-submit="canSubmit"
                    :colors="gameConfig.COLORS"
                    @add-color="handleAddColor"
                    @clear="handleClearGuess"
                    @submit="handleSubmitGuess"
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

        <ShareModal
            :visible="showShareModal"
            @share-pattern="handleSharePattern"
            @share-full="handleShareFull"
            @close="showShareModal = false"
        />

        <HowToPlayModal
            :visible="showHowToPlay"
            @close="showHowToPlay = false"
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
