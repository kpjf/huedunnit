const COLOR_HEX = {
    red: '#d94444', blue: '#3366cc', yellow: '#ccaa00', green: '#33a85a',
    purple: '#8844cc', orange: '#e07820', cyan: '#1199aa', pink: '#cc3399',
    lime: '#55cc22', maroon: '#882222',
};

const COLOR_HEX_MASTERMIND = {
    red: '#e63232', blue: '#1e44d4', yellow: '#f0cc00', green: '#22bb44',
    purple: '#8833cc', orange: '#f07820', cyan: '#00aacc', pink: '#dd1188',
};

const COLOR_EMOJI = {
    red: '🔴', blue: '🔵', yellow: '🟡', green: '🟢',
    purple: '🟣', orange: '🟠', cyan: '🩵', pink: '🩷',
};

const THEME_COLORS = {
    light:      { bg: '#f5f5f5', text: '#333333', subtext: '#999999', missBorder: '#cccccc' },
    dark:       { bg: '#111111', text: '#ffffff', subtext: '#888888', missBorder: '#3a3a3a' },
    mastermind: { bg: '#909090', text: '#111111', subtext: '#444444', missBorder: '#6a6a6a' },
};

// Draw a filled circular peg with a dome-light radial gradient
function drawPeg(ctx, x, y, d, color) {
    const r = d / 2;
    const cx = x + r;
    const cy = y + r;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    const grad = ctx.createRadialGradient(
        cx - r * 0.28, cy - r * 0.32, r * 0.04,
        cx, cy, r,
    );
    grad.addColorStop(0, 'rgba(255,255,255,0.42)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = grad;
    ctx.fill();
}

// Draw an empty (outline-only) peg
function drawEmptyPeg(ctx, x, y, d, borderColor) {
    const r = d / 2;
    const cx = x + r;
    const cy = y + r;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

function buildShareText({ guesses, codeLength, maxGuesses, isDaily, showGuesses }) {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const header = isDaily ? `HEXCode - ${today}` : 'HEXCode - Random Game';
    const score = `${guesses.length}/${maxGuesses}`;
    const grid = guesses
        .map(({ code, feedback }) => {
            const { blackPegs, whitePegs } = feedback;
            const misses = codeLength - blackPegs - whitePegs;
            const pegs = '🟩'.repeat(blackPegs) + '🟨'.repeat(whitePegs) + '⬛'.repeat(misses);
            if (!showGuesses) return pegs;
            const colors = code.map(c => COLOR_EMOJI[c] ?? '⬜').join('');
            return `${colors} ${pegs}`;
        })
        .join('\n');
    return `${header}\n${score}\n\n${grid}`;
}

async function buildShareCanvas({ guesses, codeLength, maxGuesses, isDaily, showGuesses, elapsedSeconds, theme = 'dark' }) {
    const DPR = 2;

    const tc = THEME_COLORS[theme] ?? THEME_COLORS.dark;
    const isMastermind = theme === 'mastermind';
    const pegColors = isMastermind ? COLOR_HEX_MASTERMIND : COLOR_HEX;

    // Feedback peg colors
    const hitColor        = isMastermind ? '#111111' : '#22c55e';
    const closeColor      = isMastermind ? '#e8e0d0' : '#eab308';
    const closeBorderColor = isMastermind ? '#c0b8a0' : null;

    // Guess pegs
    const SQ = 20;
    const SQ_GAP = 4;
    // Feedback dots (single-line, smaller when beside guess pegs)
    const KEY = 11;
    const KEY_GAP = 3;
    const KEY_Y_OFFSET = (SQ - KEY) / 2; // vertically center feedback dots

    const SEP = 10;
    const PADDING_X = 28;
    const PADDING_Y = 24;
    const ROW_GAP = 7;

    const guessW  = codeLength * SQ  + (codeLength - 1) * SQ_GAP;
    const keyRowW = codeLength * KEY + (codeLength - 1) * KEY_GAP;
    const rowContentW = showGuesses ? guessW + SEP + keyRowW : guessW;

    const W = Math.max(200, rowContentW + PADDING_X * 2);
    const rowX = (W - rowContentW) / 2;

    const GRID_GAP_BELOW = 14;
    const META_LINE_H = 18;
    const DATE_H = 17;

    const gridH = guesses.length * (SQ + ROW_GAP) - ROW_GAP;
    const H = PADDING_Y
        + gridH
        + GRID_GAP_BELOW
        + META_LINE_H
        + 5 + DATE_H
        + PADDING_Y;

    const canvas = document.createElement('canvas');
    canvas.width = W * DPR;
    canvas.height = H * DPR;

    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    // Background
    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, W, H);

    let y = PADDING_Y;

    // Guesses — each row is a single horizontal line
    for (const { code, feedback } of guesses) {
        const { blackPegs, whitePegs } = feedback;
        let x = rowX;

        if (showGuesses) {
            // Colored guess pegs
            code.forEach((color, i) => {
                drawPeg(ctx, x + i * (SQ + SQ_GAP), y, SQ, pegColors[color] ?? '#555555');
            });
            x += guessW + SEP;
        }

        const dots = [
            ...Array(blackPegs).fill('hit'),
            ...Array(whitePegs).fill('close'),
            ...Array(codeLength - blackPegs - whitePegs).fill('miss'),
        ];

        // Feedback dots — single horizontal row
        const dotD  = showGuesses ? KEY : SQ;
        const dotGap = showGuesses ? KEY_GAP : SQ_GAP;
        const dotY  = showGuesses ? y + KEY_Y_OFFSET : y;

        dots.forEach((type, i) => {
            const px = x + i * (dotD + dotGap);
            if (type === 'miss') {
                drawEmptyPeg(ctx, px, dotY, dotD, tc.missBorder);
            } else if (type === 'close' && closeBorderColor) {
                drawPeg(ctx, px, dotY, dotD, closeColor);
                const r = dotD / 2;
                ctx.beginPath();
                ctx.arc(px + r, dotY + r, r - 1, 0, Math.PI * 2);
                ctx.strokeStyle = closeBorderColor;
                ctx.lineWidth = 0.75;
                ctx.stroke();
            } else {
                drawPeg(ctx, px, dotY, dotD, type === 'hit' ? hitColor : closeColor);
            }
        });

        y += SQ + ROW_GAP;
    }

    y += GRID_GAP_BELOW;

    // Score · Time  (single line)
    const mins = elapsedSeconds != null ? Math.floor(elapsedSeconds / 60) : null;
    const secs = elapsedSeconds != null ? String(elapsedSeconds % 60).padStart(2, '0') : null;
    const metaLine = elapsedSeconds != null
        ? `${guesses.length}/${maxGuesses}  ·  ${mins}:${secs}`
        : `${guesses.length}/${maxGuesses}`;
    ctx.fillStyle = tc.text;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(metaLine, W / 2, y + 13);
    y += META_LINE_H;

    y += 5;

    // Date
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    ctx.fillStyle = tc.subtext;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isDaily ? today : 'Random Game', W / 2, y + 12);

    return canvas;
}

async function doShare({ guesses, codeLength, maxGuesses, isDaily, showGuesses, elapsedSeconds, theme, onCopied }) {
    const canvas = await buildShareCanvas({ guesses, codeLength, maxGuesses, isDaily, showGuesses, elapsedSeconds, theme });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], 'hexcode.png', { type: 'image/png' });

    // 1. Share image natively (mobile / PWA)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: 'HEXCode' });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
        }
    }

    // 2. Share text natively
    if (navigator.share) {
        try {
            await navigator.share({ text: buildShareText({ guesses, codeLength, maxGuesses, isDaily, showGuesses }) });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
        }
    }

    // 3. Download image as fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hexcode.png';
    a.click();
    URL.revokeObjectURL(url);
    onCopied?.();
}

export function useShareImage() {
    function shareResults(opts) {
        return doShare({ ...opts, showGuesses: false });
    }

    function shareReview(opts) {
        return doShare({ ...opts, showGuesses: true });
    }

    return { shareResults, shareReview };
}
