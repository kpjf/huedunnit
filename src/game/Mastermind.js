import { CONFIG } from './config.js';
import { SeededRandom } from './SeededRandom.js';

export class Mastermind {
    constructor(seed = null) {
        this.seed = seed;
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
        for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
            const randomIndex = this.rng.nextInt(CONFIG.COLORS.length);
            code.push(CONFIG.COLORS[randomIndex]);
        }
        return code;
    }

    addColorToGuess(color) {
        if (this.currentGuess.length < CONFIG.CODE_LENGTH) {
            this.currentGuess.push(color);
        }
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
        if (this.currentGuess.length !== CONFIG.CODE_LENGTH) return null;
        if (this.gameOver) return null;

        const feedback = this.generateFeedback(this.currentGuess);
        this.guesses.push({ code: [...this.currentGuess], feedback });

        if (feedback.blackPegs === CONFIG.CODE_LENGTH) {
            this.gameOver = true;
            this.won = true;
        }

        if (this.guesses.length >= CONFIG.MAX_GUESSES && !this.won) {
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

        for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
            if (guessCopy[i] === secretCopy[i]) {
                blackPegs++;
                guessCopy[i] = null;
                secretCopy[i] = null;
            }
        }

        for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
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

    isGameOver() { return this.gameOver; }
    hasWon() { return this.won; }
    getSecretCode() { return this.secretCode; }
    getGuesses() { return this.guesses; }
    getCurrentGuess() { return this.currentGuess; }
    getRemainingGuesses() { return CONFIG.MAX_GUESSES - this.guesses.length; }
}
