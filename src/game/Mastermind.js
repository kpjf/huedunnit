import { MODES } from './config.js';
import { SeededRandom } from './SeededRandom.js';

export class Mastermind {
    constructor(seed = null, config = MODES.classic) {
        this.seed = seed;
        this.config = config;
        this.rng = new SeededRandom(seed);
        this.secretCode = [];
        this.guesses = [];
        this.currentGuess = [];
        this.gameOver = false;
        this.won = false;
        this.startNewGame();
    }

    startNewGame() {
        this.rng = new SeededRandom(this.seed);
        this.secretCode = this.generateRandomCode();
        this.guesses = [];
        this.currentGuess = [];
        this.gameOver = false;
        this.won = false;
    }

    generateRandomCode() {
        const code = [];
        for (let i = 0; i < this.config.CODE_LENGTH; i++) {
            const randomIndex = this.rng.nextInt(this.config.COLORS.length);
            code.push(this.config.COLORS[randomIndex]);
        }
        return code;
    }

    addColorToGuess(color) {
        if (this.currentGuess.length < this.config.CODE_LENGTH) {
            this.currentGuess.push(color);
        }
    }

    setColorAtIndex(index, color) {
        if (index < 0 || index >= this.config.CODE_LENGTH) return;
        while (this.currentGuess.length <= index) {
            this.currentGuess.push(null);
        }
        this.currentGuess[index] = color;
    }

    clearCurrentGuess() {
        this.currentGuess = [];
    }

    removePegAtIndex(index) {
        if (index >= 0 && index < this.currentGuess.length) {
            this.currentGuess.splice(index, 1);
        }
    }

    submitGuess() {
        if (this.currentGuess.length !== this.config.CODE_LENGTH || this.currentGuess.includes(null)) return null;
        if (this.gameOver) return null;

        const feedback = this.generateFeedback(this.currentGuess);
        this.guesses.push({ code: [...this.currentGuess], feedback });

        if (feedback.blackPegs === this.config.CODE_LENGTH) {
            this.gameOver = true;
            this.won = true;
        }

        if (this.guesses.length >= this.config.MAX_GUESSES && !this.won) {
            this.gameOver = true;
            this.won = false;
        }

        this.currentGuess = [];
        return feedback;
    }

    generateFeedback(guess) {
        let blackPegs = 0;
        let whitePegs = 0;
        const secretCopy = [...this.secretCode];
        const guessCopy = [...guess];

        for (let i = 0; i < this.config.CODE_LENGTH; i++) {
            if (guessCopy[i] === secretCopy[i]) {
                blackPegs++;
                guessCopy[i] = null;
                secretCopy[i] = null;
            }
        }

        for (let i = 0; i < this.config.CODE_LENGTH; i++) {
            if (guessCopy[i] !== null) {
                const index = secretCopy.indexOf(guessCopy[i]);
                if (index !== -1) {
                    whitePegs++;
                    secretCopy[index] = null;
                }
            }
        }

        return { blackPegs, whitePegs };
    }

    restoreState(guesses, currentGuess = []) {
        this.guesses = guesses;
        this.currentGuess = currentGuess;
        if (guesses.length > 0) {
            const last = guesses[guesses.length - 1];
            if (last.feedback.blackPegs === this.config.CODE_LENGTH) {
                this.gameOver = true;
                this.won = true;
            } else if (guesses.length >= this.config.MAX_GUESSES) {
                this.gameOver = true;
                this.won = false;
            }
        }
    }

    isGameOver() { return this.gameOver; }
    hasWon() { return this.won; }
    getSecretCode() { return this.secretCode; }
    getGuesses() { return this.guesses; }
    getCurrentGuess() { return this.currentGuess; }
    getRemainingGuesses() { return this.config.MAX_GUESSES - this.guesses.length; }
}
