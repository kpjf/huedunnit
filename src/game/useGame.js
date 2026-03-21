import { ref, computed } from 'vue';
import { Mastermind } from './Mastermind.js';
import { MODES } from './config.js';

export function useGame() {
    let game = new Mastermind(null, MODES.classic);

    const currentSeed = ref(null);
    const gameConfig = ref(MODES.classic);
    const guesses = ref([]);
    const currentGuess = ref([]);
    const gameOver = ref(false);
    const won = ref(false);
    const secretCode = ref([...game.getSecretCode()]);

    const remainingGuesses = computed(() => gameConfig.value.MAX_GUESSES - guesses.value.length);
    const canSubmit = computed(() =>
        currentGuess.value.length === gameConfig.value.CODE_LENGTH &&
        !currentGuess.value.includes(null) &&
        !gameOver.value
    );

    function syncState() {
        guesses.value = [...game.getGuesses()];
        currentGuess.value = [...game.getCurrentGuess()];
        gameOver.value = game.isGameOver();
        won.value = game.hasWon();
        secretCode.value = [...game.getSecretCode()];
    }

    function startRandomGame(mode = 'classic') {
        currentSeed.value = null;
        gameConfig.value = MODES[mode];
        game = new Mastermind(null, MODES[mode]);
        syncState();
    }

    function startStoryLevel(levelConfig, seed) {
        const config = {
            CODE_LENGTH: levelConfig.codeLength,
            MAX_GUESSES: levelConfig.maxGuesses,
            COLORS: levelConfig.colors,
        };
        currentSeed.value = seed;
        gameConfig.value = config;
        game = new Mastermind(seed, config);
        syncState();
    }

    function restoreGame(seed, mode, savedState) {
        currentSeed.value = seed;
        gameConfig.value = MODES[mode];
        game = new Mastermind(seed, MODES[mode]);
        game.restoreState(savedState.guesses, savedState.currentGuess || []);
        syncState();
    }

    function startSeededGame(seed, mode = 'classic') {
        currentSeed.value = seed || null;
        gameConfig.value = MODES[mode];
        game = new Mastermind(currentSeed.value, MODES[mode]);
        syncState();
    }

    function addColor(color) {
        game.addColorToGuess(color);
        currentGuess.value = [...game.getCurrentGuess()];
    }

    function removeColorAt(index) {
        game.removePegAtIndex(index);
        currentGuess.value = [...game.getCurrentGuess()];
    }

    function setColorAt(index, color) {
        game.setColorAtIndex(index, color);
        currentGuess.value = [...game.getCurrentGuess()];
    }

    function clearGuess() {
        game.clearCurrentGuess();
        currentGuess.value = [];
    }

    function submitGuess() {
        const feedback = game.submitGuess();
        if (feedback !== null) {
            syncState();
        }
        return feedback;
    }

    return {
        currentSeed,
        gameConfig,
        guesses,
        currentGuess,
        gameOver,
        won,
        secretCode,
        remainingGuesses,
        canSubmit,
        startRandomGame,
        startSeededGame,
        startStoryLevel,
        restoreGame,
        addColor,
        removeColorAt,
        setColorAt,
        clearGuess,
        submitGuess,
    };
}
