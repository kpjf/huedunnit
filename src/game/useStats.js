const STORAGE_KEY = 'hexcode-stats';

function emptyModeStats() {
    return {
        streak: 0,
        lastWonDate: null,
        lastRecordedDate: null,
        distribution: {},
        dailies: [],
    };
}

function loadAll() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function yesterday(dateStr) {
    const d = new Date(dateStr.slice(0, 10) + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

export function recordResult(date, mode, won, guessCount, durationSeconds, solution, guesses) {
    date = date.slice(0, 10);
    const all = loadAll();
    const stats = all[mode] ?? emptyModeStats();

    // Idempotent — skip if already recorded for this date
    if (stats.lastRecordedDate === date) return false;

    if (won) {
        stats.streak = stats.lastWonDate === yesterday(date) ? stats.streak + 1 : 1;
        stats.lastWonDate = date;
        const key = String(guessCount);
        stats.distribution[key] = (stats.distribution[key] ?? 0) + 1;
        if (!stats.dailies) stats.dailies = [];
        stats.dailies.push({
            date,
            guessCount,
            durationSeconds: durationSeconds ?? null,
            solution: solution ?? null,
            guesses: guesses ?? null,
        });
    } else {
        stats.streak = 0;
    }

    stats.lastRecordedDate = date;
    all[mode] = stats;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
}

export function loadStats(mode) {
    const all = loadAll();
    return all[mode] ?? emptyModeStats();
}

export function checkAndExpireStreak(date, mode) {
    date = date.slice(0, 10);
    const all = loadAll();
    const stats = all[mode] ?? emptyModeStats();

    // Already recorded today — nothing to expire
    if (stats.lastRecordedDate === date) return;

    // If last recorded was before yesterday, the streak has lapsed
    if (stats.streak > 0 && stats.lastRecordedDate && stats.lastRecordedDate < yesterday(date)) {
        stats.streak = 0;
        all[mode] = stats;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
}
