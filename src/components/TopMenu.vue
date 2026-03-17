<script setup>
defineProps({
    darkMode: {
        type: Boolean,
        required: true,
    },
});

defineEmits(['toggle-dark-mode', 'new-game']);
</script>

<template>
    <div class="top-menu">
        <div class="menu-content">
            <div class="menu-left">
                <RouterLink to="/">
                    <img src="/images/logo.svg" width="22" alt="" />
                    <h2>HEXCode</h2>
                </RouterLink>
            </div>
            <div class="menu-right">
                <button
                    class="btn btn-menu"
                    title="Toggle dark mode"
                    @click="$emit('toggle-dark-mode')"
                >
                    <span class="dark-mode-icon">{{ darkMode ? '☀️' : '🌙' }}</span>
                </button>
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
    color: #000000aa;
}

:global(html.dark-mode) .menu-left a {
    color: #ffffffaa;
}

.menu-center {
    flex: 1;
    text-align: center;
}

.menu-center h2 {
    font-size: 1.4em;
    font-weight: 700;
    margin: 0;
}

.menu-right {
    flex: 1;
    text-align: right;
}

.btn-menu {
    background: transparent;
    color: var(--bg-primary);
    padding: 8px 14px;
    border: none;
    font-size: 0.85em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    appearance: none;
}

.btn-menu:hover {
    opacity: 0.85;
    transform: translateY(-1px);
}

.dark-mode-icon {
    font-size: 1rem;
}

@media (max-width: 480px) {
    .top-menu {
        padding: 8px 12px;
    }

    .menu-center h2 {
        font-size: 1.2em;
    }

    .btn-menu {
        padding: 7px 12px;
        font-size: 0.8em;
    }
}

@media (max-width: 380px) {
    .top-menu {
        padding: 10px 12px;
    }

    .menu-center h2 {
        font-size: 1.1em;
    }
}
</style>
