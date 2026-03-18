<script setup>
defineProps({
    variant: { type: String, default: 'primary' }, // primary | secondary | ghost | icon
    size: { type: String, default: 'md' },          // sm | md | lg
    full: { type: Boolean, default: false },
    onDark: { type: Boolean, default: false },       // button sits on a dark background
    completed: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
});
</script>

<template>
    <button
        :type="type"
        class="app-btn"
        :class="[
            `app-btn--${variant}`,
            `app-btn--${size}`,
            { 'app-btn--full': full, 'app-btn--on-dark': onDark, 'app-btn--completed': completed },
        ]"
    >
        <slot />
    </button>
</template>

<style scoped>
.app-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 100px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
    line-height: 1;
    text-align: center;
}

/* Sizes */
.app-btn--lg { padding: 12px 24px; font-size: 1rem; }
.app-btn--md { padding: 11px 22px; font-size: 0.95em; }
.app-btn--sm { padding: 8px 20px; font-size: 0.875em; }

/* Full width */
.app-btn--full { width: 100%; }

/* Completed */
.app-btn--completed { opacity: 0.5; }

/* Disabled (shared) */
.app-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* --- Primary: solid, high contrast --- */
.app-btn--primary {
    background: var(--text-primary);
    color: var(--bg-primary);
}
.app-btn--primary:hover:not(:disabled) { opacity: 0.8; }

/* Primary on dark background (intro screen) */
.app-btn--primary.app-btn--on-dark {
    background: #fff;
    color: #000;
}

/* --- Secondary: subtle fill --- */
.app-btn--secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}
.app-btn--secondary:hover:not(:disabled) {
    background: var(--bg-tertiary);
    border-color: var(--text-secondary);
}

/* --- Ghost: transparent outline --- */
.app-btn--ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
}
.app-btn--ghost:hover:not(:disabled) {
    color: var(--text-primary);
    border-color: var(--text-secondary);
}

/* Ghost on dark background */
.app-btn--ghost.app-btn--on-dark {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.4);
}
.app-btn--ghost.app-btn--on-dark:hover:not(:disabled) {
    border-color: #fff;
}

/* --- Icon: bare icon button --- */
.app-btn--icon {
    background: transparent;
    border: none;
    color: inherit;
    padding: 8px;
    border-radius: 8px;
}
.app-btn--icon:hover:not(:disabled) { opacity: 0.7; }
</style>
