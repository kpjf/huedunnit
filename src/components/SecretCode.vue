<script setup>
    defineProps({
        secretCode: {
            type: Array,
            required: true,
        },
    });
</script>

<template>
    <div class="secret-code-container">
        <h2>Secret Code:</h2>
        <div class="secret-code">
            <div
                v-for="(color, i) in secretCode"
                :key="i"
                class="peg"
                :class="color"
            />
        </div>
    </div>
</template>

<style scoped>
.secret-code-container {
    background: var(--bg-tertiary);
    padding: 18px;
    margin-bottom: 20px;
    text-align: center;
    border-left: 4px solid var(--text-primary);
}

.secret-code-container.hidden {
    display: none;
}

.secret-code-container h2 {
    font-size: 1em;
    margin-bottom: 12px;
    color: var(--text-primary);
    font-weight: 600;
}

.secret-code {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.secret-code .peg {
    width: 45px;
    height: 45px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 480px) {
    .secret-code .peg {
        width: 40px;
        height: 40px;
    }
}

@media (max-width: 380px) {
    .secret-code-container h2 {
        font-size: 0.95em;
    }
}
</style>
