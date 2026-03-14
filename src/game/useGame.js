import { ref, computed } from 'vue';
import { Mastermind } from './Mastermind.js';
import { CONFIG } from './config.js';

export function useGame() {
    let game = new Mastermind(null);

    const currentSeed = ref(null);
    const guesses = ref([]);
    const currentGuess = ref([]);
    const gameOver = ref(false);
    const won = ref(false);
    const secretCode = ref([...game.getSecretCode()]);

    const remainingGuesses = computed(() => CONFIG.MAX_GUESSES - guesses.value.length);
    const canSubmit = computed(() => currentGuess.value.length === CONFIG.CODE_LENGTH && !gameOver.value);

    function syncState() {
        guesses.value = [...game.getGuesses()];
        currentGuess.value = [...game.getCurrentGuess()];
        gameOver.value = game.isGameOver();
        won.value = game.hasWon();
        secretCode.value = [...game.getSecretCode()];
    }

    function startNewGame() {
        game = new Mastermind(currentSeed.value);
        syncState();
    }

    function startRandomGame() {
        currentSeed.value = null;
        game = new Mastermind(null);
        syncState();
    }

    function startSeededGame(seed) {
        currentSeed.value = seed || null;
        game = new Mastermind(currentSeed.value);
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
        guesses,
        currentGuess,
        gameOver,
        won,
        secretCode,
        remainingGuesses,
        canSubmit,
        startNewGame,
        startRandomGame,
        startSeededGame,
        addColor,
        removeColorAt,
        clearGuess,
        submitGuess,
    };
}
