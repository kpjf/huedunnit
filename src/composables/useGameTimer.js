import { ref, computed } from 'vue';

export function useGameTimer() {
    const elapsedSeconds = ref(0);
    let timerInterval = null;

    function startTimer(from = 0) {
        elapsedSeconds.value = from;
        timerInterval = setInterval(() => { elapsedSeconds.value++; }, 1000);
    }

    function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    function resetTo(seconds) {
        elapsedSeconds.value = seconds;
    }

    const formattedTime = computed(() => {
        const m = Math.floor(elapsedSeconds.value / 60);
        const s = elapsedSeconds.value % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    });

    return { elapsedSeconds, formattedTime, startTimer, stopTimer, resetTo };
}
