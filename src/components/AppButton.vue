<script setup>
defineProps({
    variant: { type: String, default: 'primary' }, // primary | secondary | ghost | icon
    size: { type: String, default: 'md' }, // sm | md | lg
    full: { type: Boolean, default: false },
    onDark: { type: Boolean, default: false }, // button sits on a dark background
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
    font-weight: 400;
    font-family: "Archivo Black", sans-serif;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
    line-height: 1;
    text-align: center;
}

/* Sizes */
.app-btn--lg {
    padding: 12px 24px;
    font-size: 1rem;
}
.app-btn--md {
    padding: 11px 22px;
    font-size: 0.95em;
}
.app-btn--sm {
    padding: 8px 20px;
    font-size: 0.875em;
}

/* Full width */
.app-btn--full {
    width: 100%;
}

/* Completed */
.app-btn--completed {
    opacity: 0.5;
}

/* Disabled (shared) */
.app-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* --- Primary: solid, high contrast --- */
.app-btn--primary {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-color);
}
.app-btn--primary:hover:not(:disabled) {
    opacity: 0.8;
}

/* --- Secondary: subtle fill --- */
.app-btn--secondary {
    background: var(--btn-secondary-bg);
    color: var(--btn-secondary-color);
    border: 1px solid var(--btn-secondary-border);
}
.app-btn--secondary:hover:not(:disabled) {
    background: var(--btn-secondary-bg-hover);
    border-color: var(--text-secondary);
}

/* --- Ghost: transparent outline --- */
.app-btn--ghost {
    background: transparent;
    color: var(--btn-ghost-color);
    border: 1px solid var(--btn-ghost-border);
}
.app-btn--ghost:hover:not(:disabled) {
    color: var(--btn-ghost-color-hover);
    border-color: var(--text-secondary);
}

/* --- Icon: bare icon button --- */
.app-btn--icon {
    background: transparent;
    border: none;
    color: inherit;
    padding: 8px;
    border-radius: 8px;
}
.app-btn--icon:hover:not(:disabled) {
    opacity: 0.7;
}
</style>
