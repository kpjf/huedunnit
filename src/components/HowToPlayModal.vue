<script setup>
import { ref, watch } from 'vue';
import AppButton from './AppButton.vue';

const props = defineProps({
    visible: { type: Boolean, required: true },
});

const emit = defineEmits(['close']);

const dialogEl = ref(null);
const dontShowAgain = ref(false);

watch(
    () => props.visible,
    (val) => {
        if (val) {
            dialogEl.value?.showModal();
        } else {
            dialogEl.value?.close();
        }
    },
);

function handleClose() {
    if (dontShowAgain.value) {
        localStorage.setItem('hexcode_htp_seen', '1');
    }
    emit('close');
}

// Native Escape key fires the 'cancel' event on <dialog>
function handleCancel(e) {
    e.preventDefault();
    handleClose();
}
</script>

<template>
    <dialog ref="dialogEl" @cancel="handleCancel" @click.self="handleClose">
        <button class="close-btn" aria-label="Close" @click="handleClose">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                    d="M1 1L13 13M13 1L1 13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        </button>

        <h3>How to Play</h3>
        <p class="subtitle">
            Crack the hidden color code. After each guess, pegs tell you how close you are.
        </p>

        <div class="examples">
            <!-- Row 1: No match -->
            <div class="example-row">
                <div class="example-pegs">
                    <div class="peg purple" style="--peg-size: 32px"></div>
                    <div class="peg orange" style="--peg-size: 32px"></div>
                    <div class="peg cyan" style="--peg-size: 32px"></div>
                    <div class="peg pink" style="--peg-size: 32px"></div>
                </div>
                <div class="example-key-pegs">
                    <div class="key-peg empty"></div>
                    <div class="key-peg empty"></div>
                    <div class="key-peg empty"></div>
                    <div class="key-peg empty"></div>
                </div>
                <p class="example-label">No pegs — none of these colors are in the code</p>
            </div>

            <!-- Row 2: White pegs -->
            <div class="example-row">
                <div class="example-pegs">
                    <div class="peg blue" style="--peg-size: 32px"></div>
                    <div class="peg red" style="--peg-size: 32px"></div>
                    <div class="peg yellow" style="--peg-size: 32px"></div>
                    <div class="peg orange" style="--peg-size: 32px"></div>
                </div>
                <div class="example-key-pegs">
                    <div class="key-peg white"></div>
                    <div class="key-peg white"></div>
                    <div class="key-peg empty"></div>
                    <div class="key-peg empty"></div>
                </div>
                <p class="example-label"><strong>White</strong> — right color, wrong position</p>
            </div>

            <!-- Row 3: All black (fully correct) -->
            <div class="example-row">
                <div class="example-pegs">
                    <div class="peg red" style="--peg-size: 32px"></div>
                    <div class="peg blue" style="--peg-size: 32px"></div>
                    <div class="peg yellow" style="--peg-size: 32px"></div>
                    <div class="peg green" style="--peg-size: 32px"></div>
                </div>
                <div class="example-key-pegs">
                    <div class="key-peg black"></div>
                    <div class="key-peg black"></div>
                    <div class="key-peg black"></div>
                    <div class="key-peg black"></div>
                </div>
                <p class="example-label">
                    <strong>Black</strong> — right color <em>and</em> position
                </p>
            </div>
        </div>

        <div class="modal-footer">
            <label class="dont-show">
                <input v-model="dontShowAgain" type="checkbox" />
                Don't show again
            </label>
            <AppButton @click="handleClose">Got it</AppButton>
        </div>
    </dialog>
</template>

<style scoped>
dialog {
    background: var(--bg-modal);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 28px 24px;
    max-width: 420px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

.close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    line-height: 0;
}

.close-btn:hover {
    color: var(--text-primary);
}

dialog h3 {
    font-size: 1.15em;
    margin-bottom: 8px;
    padding-right: 24px;
}

.subtitle {
    font-size: 0.875em;
    color: var(--text-secondary);
    margin-bottom: 22px;
    line-height: 1.5;
}

.examples {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
}

.example-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.example-pegs {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.example-key-pegs {
    width: 28px;
    height: 28px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 3px;
    flex-shrink: 0;
}

.example-label {
    font-size: 0.82em;
    color: var(--text-secondary);
    line-height: 1.4;
}

.example-label strong {
    color: var(--text-primary);
    font-weight: 600;
}

.example-label em {
    font-style: italic;
    color: var(--text-primary);
}

.modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.dont-show {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.85em;
    color: var(--text-secondary);
    cursor: pointer;
    user-select: none;
}

.dont-show input[type='checkbox'] {
    cursor: pointer;
    accent-color: var(--btn-primary-bg);
    width: 14px;
    height: 14px;
}
</style>
