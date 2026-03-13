# Mastermind Game

A modern web-based implementation of the classic Mastermind code-breaking board game, built with vanilla JavaScript following best coding practices.

## Game Rules

- **Objective**: Guess the secret 4-peg code within 10 attempts
- **Secret Code**: Randomly generated using 8 distinct colors
- **Feedback System**:
  - **Black Peg**: You have a correct color in the correct position
  - **White Peg**: You have a correct color in the wrong position
  - **Empty**: That color is not in the code at all

## Features

✨ **User-Friendly Interface**
- Clean, modern design with gradient background
- Real-time visual feedback as you build guesses
- Responsive layout works on desktop and mobile

🎨 **8 Contrasting Colors**
- Red, Blue, Yellow, Green, Purple, Orange, Cyan, Pink
- Highly distinct colors for accessibility
- Color indicators throughout the interface

🎮 **Game Mechanics**
- 10 attempts to crack the code
- Instant feedback on each guess
- Clear indication of remaining guesses
- Win/lose messaging with emojis

⚙️ **Best Practices**
- Modular code architecture with separated concerns
- Object-oriented design (Game Logic & UI Management)
- Comprehensive JSDoc comments
- Clean, readable variable and function names
- No external dependencies (vanilla JavaScript only)

## How to Play

1. **Open** `index.html` in your web browser
2. **Select colors** to build your 4-peg guess by clicking the color buttons
3. **Submit** your guess once all 4 pegs are selected
4. **Review feedback** - black and white pegs show how close you are
5. **Adjust and try** again based on the feedback
6. **Win** by guessing the exact code, or **Game Over** if you use all 10 guesses
7. **Play again** with the "New Game" button

### Controls

- **Click color buttons**: Add colors to your guess (0-4)
- **Submit Guess**: Submit your 4-color guess (or press Enter)
- **Clear**: Remove all colors from current guess
- **New Game**: Start a fresh game with a new secret code

## File Structure

```
mastermind/
├── index.html          # Game HTML structure
├── styles.css          # Complete styling and responsive design
├── game.js             # Game logic and UI management
└── README.md           # This file
```

## Code Architecture

### `game.js` Organization

**Mastermind Class** - Game Logic
- Manages the secret code generation
- Handles guess submission and validation
- Calculates feedback (black and white pegs)
- Tracks game state and win conditions

**MastermindUI Class** - User Interface
- Renders game board and current guess
- Handles user interactions
- Updates display based on game state
- Manages keyboard and button events

### Key Functions

**Game Logic:**
- `generateRandomCode()` - Creates random 4-color code
- `submitGuess()` - Validates and processes guess
- `generateFeedback()` - Calculates black/white peg feedback

**UI Functions:**
- `renderGameBoard()` - Displays all previous guesses
- `renderCurrentGuess()` - Updates the active guess builder
- `createGuessRow()` - Builds individual guess row with feedback
- `revealSecretCode()` - Shows the solution at game end

## Customization

Easy to customize:

```javascript
// In game.js, modify CONFIG object:
const CONFIG = {
    CODE_LENGTH: 4,           // Change code length
    MAX_GUESSES: 10,          // Change number of attempts
    COLORS: [...],            // Add/remove colors
    COLOR_HEX: {...}          // Modify color values
};
```

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- No external dependencies - lightweight and fast
- Efficient CSS animations and transitions
- Optimized DOM updates
- Works smoothly even on lower-end devices

## License

Free to use and modify for personal or educational purposes.
