<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';

const props = defineProps({
    guessNumber: { type: Number, required: true },
    codeLength: { type: Number, required: true },
    code: { type: Array, default: null },
    feedback: { type: Object, default: null },
    isActive: { type: Boolean, default: false },
    revealAll: { type: Boolean, default: false },
    selectedIndex: { type: Number, default: null },
});

const emit = defineEmits(['remove-at', 'select-slot']);

// null = always show (normal mode); Set = only show indices in set (reveal animation)
const revealedGuessPegs = ref(null);

const displayPegs = computed(() => {
    const slots = [];
    for (let i = 0; i < props.codeLength; i++) {
        const color = props.code?.[i] ?? null;
        const visible = revealedGuessPegs.value === null || revealedGuessPegs.value.has(i);
        slots.push(visible ? color : null);
    }
    return slots;
});

const allKeyPegs = computed(() => {
    if (!props.feedback) return Array(props.codeLength).fill('empty');
    const pegs = [];
    for (let i = 0; i < props.feedback.blackPegs; i++) pegs.push('black');
    for (let i = 0; i < props.feedback.whitePegs; i++) pegs.push('white');
    while (pegs.length < props.codeLength) pegs.push('empty');
    return pegs;
});

// Pre-populate if feedback already present on mount (restored game — no animation)
const revealed = ref(props.feedback ? Array.from({ length: props.codeLength }, (_, i) => i) : []);
const flippingOut = ref(-1);
const flippingIn = ref(-1);
const timers = [];

// Guess peg flip-in when a colour is added
const pegFlipIndex = ref(-1);
let pegFlipTimer = null;

function runRevealAnimation(animateGuessPegs = false) {
    revealed.value = [];
    flippingOut.value = -1;
    flippingIn.value = -1;
    timers.forEach(clearTimeout);
    timers.length = 0;

    if (animateGuessPegs && props.code) {
        revealedGuessPegs.value = new Set();
        for (let i = 0; i < props.codeLength; i++) {
            timers.push(
                setTimeout(() => {
                    revealedGuessPegs.value = new Set([...revealedGuessPegs.value, i]);
                    pegFlipIndex.value = i;
                }, i * 200),
            );
            timers.push(
                setTimeout(
                    () => {
                        if (pegFlipIndex.value === i) pegFlipIndex.value = -1;
                    },
                    i * 200 + 200,
                ),
            );
        }
        timers.push(
            setTimeout(
                () => {
                    revealedGuessPegs.value = null;
                },
                props.codeLength * 200 + 300,
            ),
        );
    }

    for (let i = 0; i < props.codeLength; i++) {
        timers.push(
            setTimeout(() => {
                flippingOut.value = i;
            }, i * 200),
        );
        timers.push(
            setTimeout(
                () => {
                    revealed.value.push(i);
                    flippingOut.value = -1;
                    flippingIn.value = i;
                },
                i * 200 + 150,
            ),
        );
        timers.push(
            setTimeout(
                () => {
                    flippingIn.value = -1;
                },
                i * 200 + 300,
            ),
        );
    }
}

watch(
    () => props.feedback,
    (newVal, oldVal) => {
        if (newVal && oldVal === null) {
            runRevealAnimation();
        }
    },
);

// Triggered when loading a completed game for review — runs after DOM update so
// props.feedback is guaranteed to be set for all rows simultaneously.
watch(
    () => props.revealAll,
    (val) => {
        if (val && props.feedback) {
            runRevealAnimation(true);
        }
    },
    { flush: 'post' },
);

watch(
    () => props.code,
    (newCode, oldCode) => {
        if (!props.isActive || !newCode) return;
        for (let i = 0; i < newCode.length; i++) {
            if (newCode[i] != null && (oldCode == null || oldCode[i] == null)) {
                clearTimeout(pegFlipTimer);
                pegFlipIndex.value = i;
                pegFlipTimer = setTimeout(() => {
                    pegFlipIndex.value = -1;
                }, 200);
                return;
            }
        }
    },
    { deep: true },
);

onUnmounted(() => {
    timers.forEach(clearTimeout);
    clearTimeout(pegFlipTimer);
});

const displayKeyPegs = computed(() => {
    if (!props.feedback) return Array(props.codeLength).fill({ type: 'empty', phase: null });
    return allKeyPegs.value.map((type, i) => ({
        type: revealed.value.includes(i) ? type : 'empty',
        phase: i === flippingOut.value ? 'out' : i === flippingIn.value ? 'in' : null,
    }));
});
</script>

<template>
    <div class="guess-row" :class="{ active: isActive, completed: feedback !== null }">
        <div class="guess-pegs">
            <div
                v-for="(color, i) in displayPegs"
                :key="i"
                class="peg"
                :class="[
                    color ?? 'empty',
                    {
                        'peg-flip-in': i === pegFlipIndex,
                        'peg-selected': isActive && selectedIndex === i,
                    },
                ]"
                :style="isActive ? { cursor: 'pointer' } : {}"
                @click="
                    isActive ? (color ? emit('remove-at', i) : emit('select-slot', i)) : undefined
                "
            />
        </div>
        <div class="key-pegs">
            <div
                v-for="({ type, phase }, i) in displayKeyPegs"
                :key="i"
                class="key-peg"
                :class="[type, phase && `flip-${phase}`]"
            />
        </div>
    </div>
</template>

<style scoped>
.guess-row {
    height: var(--row-height, 60px);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0.45;
    transition: opacity 0.15s ease;
    position: relative;
}

.guess-row.active {
    opacity: 1;
}

.guess-row.completed {
    opacity: 0.85;
}

.guess-row .guess-pegs {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    perspective: 400px;
}

.guess-row .key-pegs {
    display: flex;
    gap: 3px;
    margin-left: 8px;
    flex-shrink: 0;
    perspective: 200px;
}

@keyframes flip-out {
    from {
        transform: rotateX(0deg);
    }
    to {
        transform: rotateX(-90deg);
    }
}

@keyframes flip-in {
    from {
        transform: rotateX(90deg);
    }
    to {
        transform: rotateX(0deg);
    }
}

.key-peg.flip-out {
    animation: flip-out 0.15s ease-in forwards;
}

.key-peg.flip-in {
    animation: flip-in 0.15s ease-out forwards;
}

.peg.peg-flip-in {
    animation: flip-in 0.15s ease-out forwards;
}

@keyframes peg-pulse {
    0%,
    100% {
        box-shadow: 0 0 0 2px var(--text-primary);
    }
    50% {
        box-shadow: 0 0 0 4px var(--text-primary);
    }
}

.peg.peg-selected {
    animation: peg-pulse 0.9s ease-in-out infinite;
}
</style>
