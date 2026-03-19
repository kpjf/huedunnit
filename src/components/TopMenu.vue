<script setup>
import AppButton from './AppButton.vue';

defineProps({
    darkMode: {
        type: Boolean,
        required: true,
    },
    timer: {
        type: String,
        default: null,
    },
});

defineEmits(['toggle-dark-mode', 'new-game']);
</script>

<template>
    <div class="top-menu">
        <div class="menu-content">
            <div class="menu-left">
                <RouterLink to="/">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        :style="{ stroke: darkMode ? '#fff' : '#111' }"
                    >
                        <path
                            d="M13 4L7 10L13 16"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                    </svg>
                </RouterLink>
            </div>
            <div class="menu-right">
                <span v-if="timer" class="timer">{{ timer }}</span>
                <AppButton
                    variant="icon"
                    title="Toggle dark mode"
                    @click="$emit('toggle-dark-mode')"
                >
                    <svg
                        width="18"
                        height="22"
                        viewBox="0 0 18 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        :style="{ color: darkMode ? '#fff' : '#111' }"
                    >
                        <rect x="1" y="1" width="16" height="20" rx="3" stroke="currentColor" stroke-width="1.5"/>
                        <rect x="4" :y="darkMode ? 11 : 3" width="10" height="8" rx="2" fill="currentColor"/>
                    </svg>
                </AppButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
.top-menu {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.menu-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 560px;
    margin: 0 auto;
}

.menu-left {
    flex: 1;
    text-align: left;
}

.menu-left a {
    display: inline-flex;
    justify-content: start;
    align-items: center;
    gap: 6px;
    text-decoration: none;
}


.timer {
    font-size: 1.1em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
    letter-spacing: 0.02em;
}

.menu-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
}


@media (max-width: 480px) {
    .top-menu {
        padding: 8px 12px;
    }
}

@media (max-width: 380px) {
    .top-menu {
        padding: 10px 12px;
    }
}
</style>
