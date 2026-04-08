<script setup>
import { ref, watch } from 'vue';
import { useBattleStore } from '../stores/battle.js';
import { useBattleSocket } from '../composables/useBattleSocket.js';
import AppButton from './AppButton.vue';
import AppDialog from './AppDialog.vue';
import BattleCountdown from './BattleCountdown.vue';

const emit = defineEmits(['close', 'game-start']);

const store = useBattleStore();
const socket = useBattleSocket();

// 'entry' | 'join-form' | 'lobby' | 'countdown'
const view = ref('entry');
const nameInput = ref('');
const codeInput = ref('');

function handleCreate() {
    if (!nameInput.value.trim()) return;
    socket.createRoom(nameInput.value.trim());
}

function handleJoin() {
    if (!nameInput.value.trim() || codeInput.value.trim().length !== 4) return;
    socket.joinRoom(codeInput.value.trim(), nameInput.value.trim());
}

function handleStart() {
    socket.startGame();
}

function handleClose() {
    socket.disconnect();
    view.value = 'entry';
    nameInput.value = '';
    codeInput.value = '';
    emit('close');
}

function copyCode() {
    navigator.clipboard.writeText(store.roomCode);
}

// Transition views based on store phase
watch(
    () => store.phase,
    (phase) => {
        if (phase === 'lobby') view.value = 'lobby';
        if (phase === 'countdown') view.value = 'countdown';
        if (phase === 'playing') emit('game-start');
    },
);
</script>

<template>
    <BattleCountdown v-if="view === 'countdown'" />

    <AppDialog v-if="view !== 'countdown'" max-width="360px" @close="handleClose">
        <div class="dialog-body">
            <!-- ── Entry: choose create or join ──────────────────────────── -->
            <template v-if="view === 'entry'">
                <h2 class="dialog-title">Battle Mode</h2>
                <p class="dialog-subtitle">Race a friend to crack the same code.</p>

                <div class="form-group">
                    <label class="form-label">Your Name</label>
                    <input
                        v-model="nameInput"
                        class="form-input"
                        placeholder="Enter your name"
                        maxlength="20"
                        @keyup.enter="handleCreate"
                    />
                </div>

                <div v-if="store.error" class="error-msg">{{ store.error }}</div>

                <div class="entry-actions">
                    <AppButton size="lg" full :disabled="!nameInput.trim()" @click="handleCreate">
                        Create Room
                    </AppButton>
                    <AppButton
                        variant="ghost"
                        size="lg"
                        full
                        :disabled="!nameInput.trim()"
                        @click="view = 'join-form'"
                    >
                        Join a Room
                    </AppButton>
                </div>
            </template>

            <!-- ── Join form ──────────────────────────────────────────────── -->
            <template v-else-if="view === 'join-form'">
                <h2 class="dialog-title">Join a Room</h2>

                <div class="form-group">
                    <label class="form-label">Your Name</label>
                    <input
                        v-model="nameInput"
                        class="form-input"
                        placeholder="Enter your name"
                        maxlength="20"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label">Room Code</label>
                    <input
                        v-model="codeInput"
                        class="form-input form-input--code"
                        placeholder="XXXX"
                        maxlength="4"
                        @input="codeInput = codeInput.toUpperCase()"
                        @keyup.enter="handleJoin"
                    />
                </div>

                <div v-if="store.error" class="error-msg">{{ store.error }}</div>

                <div class="entry-actions">
                    <AppButton
                        size="lg"
                        full
                        :disabled="!nameInput.trim() || codeInput.trim().length !== 4"
                        @click="handleJoin"
                    >
                        Join Room
                    </AppButton>
                    <AppButton variant="ghost" size="sm" @click="view = 'entry'">Back</AppButton>
                </div>
            </template>

            <!-- ── Lobby ─────────────────────────────────────────────────── -->
            <template v-else-if="view === 'lobby'">
                <h2 class="dialog-title">
                    Room
                    <span class="room-code" @click="copyCode" title="Click to copy">
                        {{ store.roomCode }}
                    </span>
                </h2>
                <p class="dialog-subtitle">Share the code with your friends.</p>

                <ul class="player-list">
                    <li
                        v-for="player in store.players"
                        :key="player.socketId"
                        class="player-item"
                    >
                        <span class="player-name">{{ player.name }}</span>
                        <span
                            v-if="player.socketId === store.ownerSocketId"
                            class="player-badge"
                        >Host</span>
                    </li>
                </ul>

                <p v-if="store.players.length < 2" class="waiting-hint">
                    Waiting for at least one more player...
                </p>

                <div v-if="store.error" class="error-msg">{{ store.error }}</div>

                <AppButton
                    v-if="store.isOwner"
                    size="lg"
                    full
                    :disabled="!store.canStart"
                    @click="handleStart"
                >
                    Start Game
                </AppButton>
                <p v-else class="waiting-hint">Waiting for the host to start...</p>
            </template>
        </div>
    </AppDialog>
</template>

<style scoped>
.dialog-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    width: 100%;
}

.dialog-title {
    font-size: 1.4em;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.dialog-subtitle {
    color: var(--text-secondary);
    font-size: 0.9em;
    margin: -8px 0 0;
}

.form-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
}

.form-label {
    font-size: 0.8em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
}

.form-input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: #ffffff;
    color: var(--text-primary);
    font-size: 1em;
    font-family: inherit;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
}

.form-input:focus {
    border-color: var(--text-secondary);
}

.form-input--code {
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 1.4em;
    font-weight: 700;
    text-align: center;
}

.entry-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.error-msg {
    color: #e05252;
    font-size: 0.85em;
    width: 100%;
    text-align: center;
}

.room-code {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 2px 10px;
    font-family: monospace;
    font-size: 1.1em;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: opacity 0.15s;
}

.room-code:hover {
    opacity: 0.7;
}

.player-list {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.player-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.player-name {
    flex: 1;
    font-weight: 600;
    color: var(--text-primary);
    text-align: left;
}

.player-badge {
    font-size: 0.72em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 100px;
    padding: 2px 8px;
}

.waiting-hint {
    color: var(--text-secondary);
    font-size: 0.85em;
    margin: 0;
}
</style>
