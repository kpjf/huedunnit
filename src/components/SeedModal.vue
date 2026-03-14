<script setup>
    import { ref, watch, nextTick } from 'vue';

    const props = defineProps({
        visible: {
            type: Boolean,
            required: true,
        },
        initialSeed: {
            type: String,
            default: '',
        },
    });

    const emit = defineEmits(['confirm', 'cancel']);

    const inputValue = ref('');
    const inputEl = ref(null);

    watch(() => props.visible, async (val) => {
        if (val) {
            inputValue.value = props.initialSeed;
            await nextTick();
            inputEl.value?.focus();
        }
    });

    function handleConfirm() {
        emit('confirm', inputValue.value || null);
    }

    function handleCancel() {
        emit('cancel');
    }
</script>

<template>
    <Teleport to="body">
        <div
            v-if="visible"
            class="modal-overlay"
            @click.self="handleCancel"
        >
            <div class="modal">
                <h3>Enter Seed Phrase</h3>
                <p>Enter a seed for a reproducible game, or leave empty for random.</p>
                <input
                    ref="inputEl"
                    v-model="inputValue"
                    type="text"
                    class="modal-input"
                    placeholder="e.g. myseed123"
                    @keydown.enter="handleConfirm"
                    @keydown.esc="handleCancel"
                >
                <div class="modal-actions">
                    <button
                        class="btn btn-secondary"
                        @click="handleCancel"
                    >
                        Cancel
                    </button>
                    <button
                        class="btn btn-primary"
                        @click="handleConfirm"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    padding: 28px 24px;
    max-width: 380px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.modal h3 {
    font-size: 1.1em;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text-primary);
}

.modal p {
    font-size: 0.88em;
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.modal-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    font-size: 0.95em;
    background: var(--bg-secondary);
    color: var(--text-primary);
    margin-bottom: 16px;
    outline: none;
    box-sizing: border-box;
}

.modal-input:focus {
    border-color: var(--text-primary);
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}
</style>
