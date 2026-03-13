/**
 * Mastermind Game - JavaScript Implementation
 * A code-breaking game where the player must guess a 4-peg secret code
 * within 10 attempts using feedback from black and white pegs.
 */

// ============================================================================
// Seeded Random Number Generator
// ============================================================================

/**
 * Simple seeded random number generator using xorshift32
 */
class SeededRandom {
    constructor(seed = null) {
        if (seed === null || seed === '') {
            // Use true randomness if no seed provided
            this.seed = Math.floor(Math.random() * 0x7fffffff);
        } else {
            // Hash the seed string to get a number
            this.seed = this.hashString(seed);
        }
        this.current = this.seed;
    }

    /**
     * Simple hash function for strings
     * @param {string} str
     * @returns {number}
     */
    hashString(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
        }
        return Math.abs(hash) % 0x7fffffff || 1;
    }

    /**
     * Generate next random number (0 to 1)
     * @returns {number}
     */
    next() {
        this.current ^= this.current << 13;
        this.current ^= this.current >> 17;
        this.current ^= this.current << 5;
        return (this.current >>> 0) / 0x100000000;
    }

    /**
     * Generate random integer between 0 and max (exclusive)
     * @param {number} max
     * @returns {number}
     */
    nextInt(max) {
        return Math.floor(this.next() * max);
    }
}

// ============================================================================
// Game Configuration
// ============================================================================

const CONFIG = {
    CODE_LENGTH: 4,
    MAX_GUESSES: 10,
    COLORS: ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'cyan', 'pink'],
    COLOR_HEX: {
        red: '#FF0000',
        blue: '#0000FF',
        yellow: '#FFFF00',
        green: '#00CC00',
        purple: '#9933FF',
        orange: '#FF8800',
        cyan: '#00FFFF',
        pink: '#FF00FF'
    }
};

// ============================================================================
// Game Logic
// ============================================================================

class Mastermind {
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

    /**
     * Generate a random secret code
     */
    startNewGame() {
        this.secretCode = this.generateRandomCode();
        this.guesses = [];
        this.currentGuess = [];
        this.gameOver = false;
        this.won = false;
    }

    /**
     * Generate a random 4-color code from available colors
     * @returns {Array<string>} Array of color names
     */
    generateRandomCode() {
        const code = [];
        for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
            const randomIndex = this.rng.nextInt(CONFIG.COLORS.length);
            code.push(CONFIG.COLORS[randomIndex]);
        }
        return code;
    }

    /**
     * Add a color to the current guess
     * @param {string} color - Color name to add
     */
    addColorToGuess(color) {
        if (this.currentGuess.length < CONFIG.CODE_LENGTH) {
            this.currentGuess.push(color);
        }
    }

    /**
     * Remove the last color from current guess
     */
    clearCurrentGuess() {
        this.currentGuess = [];
    }

    /**
     * Remove a color from current guess at specific index
     * @param {number} index - Index of peg to remove
     */
    removePegAtIndex(index) {
        if (index >= 0 && index < this.currentGuess.length) {
            this.currentGuess.splice(index, 1);
        }
    }

    /**
     * Submit the current guess and get feedback
     * @returns {Object|null} Feedback object with key pegs or null if guess invalid
     */
    submitGuess() {
        if (this.currentGuess.length !== CONFIG.CODE_LENGTH) {
            return null;
        }

        if (this.gameOver) {
            return null;
        }

        const feedback = this.generateFeedback(this.currentGuess);
        this.guesses.push({
            code: [...this.currentGuess],
            feedback: feedback
        });

        // Check win condition
        if (feedback.blackPegs === CONFIG.CODE_LENGTH) {
            this.gameOver = true;
            this.won = true;
        }

        // Check lose condition
        if (this.guesses.length >= CONFIG.MAX_GUESSES && !this.won) {
            this.gameOver = true;
            this.won = false;
        }

        this.currentGuess = [];
        return feedback;
    }

    /**
     * Generate feedback pegs for a guess
     * @param {Array<string>} guess - The guess to evaluate
     * @returns {Object} Object with blackPegs and whitePegs count
     */
    generateFeedback(guess) {
        let blackPegs = 0;
        let whitePegs = 0;

        // Create mutable copies to track used pegs
        const secretCopy = [...this.secretCode];
        const guessCopy = [...guess];

        // First pass: count black pegs (correct color, correct position)
        for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
            if (guessCopy[i] === secretCopy[i]) {
                blackPegs++;
                guessCopy[i] = null;
                secretCopy[i] = null;
            }
        }

        // Second pass: count white pegs (correct color, wrong position)
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

    /**
     * Check if the game is over
     * @returns {boolean}
     */
    isGameOver() {
        return this.gameOver;
    }

    /**
     * Check if the player has won
     * @returns {boolean}
     */
    hasWon() {
        return this.won;
    }

    /**
     * Get the secret code (for revealing at end of game)
     * @returns {Array<string>}
     */
    getSecretCode() {
        return this.secretCode;
    }

    /**
     * Get all guesses made so far
     * @returns {Array<Object>}
     */
    getGuesses() {
        return this.guesses;
    }

    /**
     * Get current guess in progress
     * @returns {Array<string>}
     */
    getCurrentGuess() {
        return this.currentGuess;
    }

    /**
     * Get remaining guesses
     * @returns {number}
     */
    getRemainingGuesses() {
        return CONFIG.MAX_GUESSES - this.guesses.length;
    }
}

// ============================================================================
// UI Management
// ============================================================================

class MastermindUI {
    constructor(seed = null) {
        this.currentSeed = seed;
        this.game = new Mastermind(seed);
        this.initializeDarkMode();
        this.initializeUI();
        this.attachEventListeners();
    }

    /**
     * Initialize the UI elements
     */
    initializeUI() {
        this.createColorButtons();
        this.renderGameBoard();
        this.updateGameStatus();
        this.displaySeedPhrase();
    }

    /**
     * Create clickable color buttons for selection
     */
    createColorButtons() {
        const colorButtonsContainer = document.getElementById('colorButtons');
        colorButtonsContainer.innerHTML = '';

        CONFIG.COLORS.forEach(color => {
            const btn = document.createElement('button');
            btn.className = `color-btn peg ${color}`;
            btn.dataset.color = color;
            btn.addEventListener('click', () => this.selectColor(color));
            colorButtonsContainer.appendChild(btn);
        });
    }

    /**
     * Handle color selection
     * @param {string} color - Selected color
     */
    selectColor(color) {
        this.game.addColorToGuess(color);
        this.renderCurrentGuess();
    }

    /**
     * Render the current guess in progress
     */
    renderCurrentGuess() {
        const currentGuessContainer = document.getElementById('currentGuess');
        currentGuessContainer.innerHTML = '';

        for (let i = 0; i < CONFIG.CODE_LENGTH; i++) {
            const peg = document.createElement('div');
            peg.className = 'peg';

            if (i < this.game.getCurrentGuess().length) {
                const color = this.game.getCurrentGuess()[i];
                peg.classList.add(color);
                // Add click handler to remove this specific peg
                peg.addEventListener('click', () => {
                    this.game.removePegAtIndex(i);
                    this.renderCurrentGuess();
                });
            } else {
                peg.classList.add('empty');
            }

            currentGuessContainer.appendChild(peg);
        }

        // Update submit button state
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = this.game.getCurrentGuess().length !== CONFIG.CODE_LENGTH;
    }

    /**
     * Render the entire game board with all guesses
     */
    renderGameBoard() {
        const guessesContainer = document.getElementById('guessesContainer');
        guessesContainer.innerHTML = '';

        const guesses = this.game.getGuesses();

        guesses.forEach((guess, index) => {
            const guessRow = this.createGuessRow(index + 1, guess.code, guess.feedback);
            guessesContainer.appendChild(guessRow);
        });
    }

    /**
     * Create a single guess row element
     * @param {number} guessNumber
     * @param {Array<string>} code
     * @param {Object} feedback
     * @returns {HTMLElement}
     */
    createGuessRow(guessNumber, code, feedback) {
        const row = document.createElement('div');
        row.className = 'guess-row';

        // Guess number
        const numberDiv = document.createElement('div');
        numberDiv.className = 'guess-number';
        numberDiv.textContent = `#${guessNumber}`;
        row.appendChild(numberDiv);

        // Guess pegs
        const guessPegsDiv = document.createElement('div');
        guessPegsDiv.className = 'guess-pegs';
        code.forEach(color => {
            const peg = document.createElement('div');
            peg.className = `peg ${color}`;
            guessPegsDiv.appendChild(peg);
        });
        row.appendChild(guessPegsDiv);

        // Key pegs (feedback)
        const keyPegsDiv = document.createElement('div');
        keyPegsDiv.className = 'key-pegs';

        const { blackPegs, whitePegs } = feedback;

        // Add black pegs first
        for (let i = 0; i < blackPegs; i++) {
            const keyPeg = document.createElement('div');
            keyPeg.className = 'key-peg black';
            keyPegsDiv.appendChild(keyPeg);
        }

        // Add white pegs
        for (let i = 0; i < whitePegs; i++) {
            const keyPeg = document.createElement('div');
            keyPeg.className = 'key-peg white';
            keyPegsDiv.appendChild(keyPeg);
        }

        // Fill remaining space with empty pegs
        const totalFeedback = blackPegs + whitePegs;
        for (let i = totalFeedback; i < CONFIG.CODE_LENGTH; i++) {
            const keyPeg = document.createElement('div');
            keyPeg.className = 'key-peg empty';
            keyPegsDiv.appendChild(keyPeg);
        }

        row.appendChild(keyPegsDiv);
        return row;
    }

    /**
     * Update game status message
     */
    updateGameStatus() {
        const statusEl = document.getElementById('gameStatus');
        const remaining = this.game.getRemainingGuesses();

        if (this.game.hasWon()) {
            statusEl.className = 'game-status won';
            statusEl.textContent = `🎉 You Won! Solved in ${this.game.getGuesses().length} guess${this.game.getGuesses().length > 1 ? 'es' : ''}`;
        } else if (this.game.isGameOver()) {
            statusEl.className = 'game-status lost';
            statusEl.textContent = '💔 Game Over! You did not find the code.';
        } else {
            statusEl.className = 'game-status active';
            statusEl.textContent = `Guesses remaining: ${remaining} / ${CONFIG.MAX_GUESSES}`;
        }
    }

    /**
     * Reveal the secret code at end of game
     */
    revealSecretCode() {
        const secretCodeContainer = document.getElementById('secretCodeContainer');
        const secretCodeDiv = document.getElementById('secretCode');

        secretCodeDiv.innerHTML = '';
        this.game.getSecretCode().forEach(color => {
            const peg = document.createElement('div');
            peg.className = `peg ${color}`;
            secretCodeDiv.appendChild(peg);
        });

        secretCodeContainer.classList.remove('hidden');
    }

    /**
     * Update UI state to disable/enable input
     */
    updateInputState() {
        const inputSection = document.getElementById('inputSection');
        const submitBtn = document.getElementById('submitBtn');
        const clearBtn = document.getElementById('clearBtn');

        if (this.game.isGameOver()) {
            inputSection.classList.add('disabled');
            submitBtn.disabled = true;
            clearBtn.disabled = true;
        } else {
            inputSection.classList.remove('disabled');
            clearBtn.disabled = false;
        }
    }

    /**
     * Start a new game
     */
    newGame() {
        this.game.startNewGame();
        document.getElementById('secretCodeContainer').classList.add('hidden');
        this.initializeUI();
        this.renderGameBoard();
    }

    /**
     * Display the current seed phrase at the top
     */
    displaySeedPhrase() {
        const seedDisplay = document.getElementById('seedDisplay');
        if (this.currentSeed) {
            seedDisplay.textContent = `Seed: ${this.currentSeed}`;
            seedDisplay.classList.add('active');
        } else {
            seedDisplay.textContent = 'No seed - each game is random';
            seedDisplay.classList.remove('active');
        }
    }

    /**
     * Start a new game with a specific seed
     * @param {string} seed - Seed phrase for code generation
     */
    newGameWithSeed(seed) {
        this.currentSeed = seed;
        this.game = new Mastermind(seed);
        document.getElementById('secretCodeContainer').classList.add('hidden');
        this.initializeUI();
        this.renderGameBoard();
    }

    /**
     * Attach event listeners to buttons
     */
    attachEventListeners() {
        // Dark mode toggle
        document.getElementById('darkModeBtn').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Seed phrase button - opens a prompt
        document.getElementById('setSeedBtn').addEventListener('click', () => {
            this.promptForSeed();
        });

        // Random game button
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.newGameWithSeed(null);
        });

        // Submit guess button
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submitGuess();
        });

        // Clear current guess button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.game.clearCurrentGuess();
            this.renderCurrentGuess();
        });

        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            if (this.currentSeed) {
                this.newGameWithSeed(this.currentSeed);
            } else {
                this.newGame();
            }
        });

        // Allow Enter key to submit guess
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.game.isGameOver()) {
                this.submitGuess();
            }
        });
    }

    /**
     * Toggle dark mode on/off
     */
    toggleDarkMode() {
        const html = document.documentElement;
        const isDarkMode = html.classList.toggle('dark-mode');
        localStorage.setItem('mastermind-darkMode', isDarkMode);
        this.updateDarkModeIcon();
    }

    /**
     * Update dark mode icon based on current state
     */
    updateDarkModeIcon() {
        const btn = document.getElementById('darkModeBtn');
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        btn.querySelector('.dark-mode-icon').textContent = isDarkMode ? '☀️' : '🌙';
    }

    /**
     * Initialize dark mode from localStorage
     */
    initializeDarkMode() {
        const isDarkMode = localStorage.getItem('mastermind-darkMode') === 'true';
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
        }
        this.updateDarkModeIcon();
    }

    /**
     * Prompt the user for a seed phrase
     */
    promptForSeed() {
        const currentSeed = this.currentSeed || '';
        const seed = prompt('Enter a seed phrase for a reproducible game:', currentSeed);
        
        if (seed !== null) {  // User didn't cancel
            this.newGameWithSeed(seed || null);
        }
    }

    /**
     * Submit the current guess
     */
    submitGuess() {
        const feedback = this.game.submitGuess();

        if (feedback === null) {
            return;
        }

        this.renderGameBoard();
        this.renderCurrentGuess();
        this.updateGameStatus();

        if (this.game.isGameOver()) {
            this.updateInputState();
            this.revealSecretCode();
        }
    }
}

// ============================================================================
// Initialize Game on Page Load
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    new MastermindUI();
});
