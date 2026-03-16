export function useHaptics() {
    function vibrate(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    return {
        tapColor: () => vibrate(30),
        tapClear: () => vibrate(50),
        tapSubmit: () => vibrate(80),
        celebrate: () => vibrate([100, 50, 100, 50, 200]),
    };
}
