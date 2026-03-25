<script setup>
import AppButton from './AppButton.vue';

defineProps({
    theme: {
        type: String,
        default: 'mastermind',
    },
    timer: {
        type: String,
        default: null,
    },
    showShare: {
        type: Boolean,
        default: false,
    },
});

defineEmits(['toggle-dark-mode', 'new-game', 'share', 'how-to-play']);
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
                        style="stroke: var(--text-primary)"
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
                    title="How to play"
                    @click="$emit('how-to-play')"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style="color: var(--text-primary)"
                    >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.75"/>
                        <path d="M9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5V13.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
                        <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="currentColor" stroke-width="0.5"/>
                    </svg>
                </AppButton>

                <AppButton
                    v-if="showShare"
                    variant="icon"
                    title="Share results"
                    @click="$emit('share')"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style="color: var(--text-primary)"
                    >
                        <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="1.75"/>
                        <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="1.75"/>
                        <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="1.75"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
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
    font-family: "Archivo Black", sans-serif;
    font-size: 1.1em;
    font-weight: 400;
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
