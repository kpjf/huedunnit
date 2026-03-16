const COLOR_HEX = {
    red: '#d94444',
    blue: '#3366cc',
    yellow: '#ccaa00',
    green: '#33a85a',
    purple: '#8844cc',
    orange: '#e07820',
    cyan: '#1199aa',
    pink: '#cc3399',
};

const COLOR_EMOJI = {
    red: '🔴', blue: '🔵', yellow: '🟡', green: '🟢',
    purple: '🟣', orange: '🟠', cyan: '🩵', pink: '🩷',
};

function buildShareText({ guesses, codeLength, maxGuesses, isDaily, showGuesses }) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
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

function buildShareCanvas({ guesses, codeLength, maxGuesses, isDaily, showGuesses }) {
    const DPR = 2;

    // Guess square size
    const SQ = 26;
    const SQ_GAP = 5;

    // 2×2 feedback grid — same total size as one guess square
    const MINI_GAP = 2;
    const MINI = (SQ - MINI_GAP) / 2; // = 12, so 2×12 + 2 = 26 = SQ

    const SEP = 14;
    const PADDING_X = 32;
    const PADDING_Y = 28;
    const ROW_GAP = 8;
    const ROW_H = SQ;

    const guessW = codeLength * SQ + (codeLength - 1) * SQ_GAP;
    const keyW = SQ; // 2×2 grid is SQ×SQ
    const rowContentW = showGuesses ? guessW + SEP + keyW : keyW;

    const W = Math.max(240, rowContentW + PADDING_X * 2);
    const rowX = (W - rowContentW) / 2;

    const HEADER_H = 86;
    const gridH = guesses.length * (ROW_H + ROW_GAP) - ROW_GAP;
    const FOOTER_H = 32;
    const H = PADDING_Y + HEADER_H + 20 + gridH + 20 + FOOTER_H + PADDING_Y;

    const canvas = document.createElement('canvas');
    canvas.width = W * DPR;
    canvas.height = H * DPR;

    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, W, H);

    let y = PADDING_Y;

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HEXCode', W / 2, y + 24);
    y += 36;

    // Date or "Random Game"
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    ctx.fillStyle = '#888888';
    ctx.font = '13px sans-serif';
    ctx.fillText(isDaily ? today : 'Random Game', W / 2, y + 14);
    y += 26;

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace, monospace';
    ctx.fillText(`${guesses.length} / ${maxGuesses}`, W / 2, y + 20);
    y += 24;

    y += 20;

    for (const { code, feedback } of guesses) {
        const { blackPegs, whitePegs } = feedback;
        let x = rowX;

        // Guess color squares
        if (showGuesses) {
            code.forEach((color, i) => {
                ctx.fillStyle = COLOR_HEX[color] ?? '#555555';
                ctx.fillRect(x + i * (SQ + SQ_GAP), y, SQ, SQ);
            });
            x += guessW + SEP;
        }

        // 2×2 feedback grid
        const dots = [
            ...Array(blackPegs).fill('hit'),
            ...Array(whitePegs).fill('close'),
            ...Array(codeLength - blackPegs - whitePegs).fill('miss'),
        ];

        dots.forEach((type, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            ctx.fillStyle = type === 'hit' ? '#22c55e' : type === 'close' ? '#eab308' : '#3a3a3a';
            ctx.fillRect(x + col * (MINI + MINI_GAP), y + row * (MINI + MINI_GAP), MINI, MINI);
        });

        y += ROW_H + ROW_GAP;
    }

    y += 12;

    // Footer
    ctx.fillStyle = '#444444';
    ctx.font = '12px monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('hexcode', W / 2, y + 14);

    return canvas;
}

async function doShare({ guesses, codeLength, maxGuesses, isDaily, showGuesses, onCopied }) {
    const canvas = buildShareCanvas({ guesses, codeLength, maxGuesses, isDaily, showGuesses });
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
