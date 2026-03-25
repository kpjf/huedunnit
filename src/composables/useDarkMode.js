import { ref, computed, watch } from 'vue';

const THEMES = ['light', 'dark', 'mastermind'];

export function useDarkMode() {
    const stored = localStorage.getItem('mastermind-theme');
    const initial = THEMES.includes(stored) ? stored : 'mastermind';
    const theme = ref(initial);

    watch(theme, (val) => {
        document.documentElement.classList.remove('dark-mode', 'mastermind-mode');
        if (val === 'dark') document.documentElement.classList.add('dark-mode');
        if (val === 'mastermind') document.documentElement.classList.add('mastermind-mode');
        localStorage.setItem('mastermind-theme', val);
    }, { immediate: true });

    const isDark = computed(() => theme.value !== 'light');

    function toggleDarkMode() {
        const idx = THEMES.indexOf(theme.value);
        theme.value = THEMES[(idx + 1) % THEMES.length];
    }

    return { theme, isDark, toggleDarkMode };
}
