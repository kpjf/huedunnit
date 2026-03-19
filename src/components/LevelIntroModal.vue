<script setup>
import { computed } from 'vue';
import AppButton from './AppButton.vue';
import { ZONE_DEFS, MODIFIER_META } from '../game/storyLevels.js';

const props = defineProps({
    level: { type: Object, required: true },
    attemptsUsed: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
});

const emit = defineEmits(['play', 'back']);

const MAX_DAILY_ATTEMPTS = 3;
const attemptsLeft = computed(() => MAX_DAILY_ATTEMPTS - props.attemptsUsed);

const zone = computed(() => ZONE_DEFS.find((z) => z.id === props.level.zone));

const uniqueModifiers = computed(() => {
    const seen = new Set();
    return props.level.modifiers.filter((m) => {
        if (seen.has(m.type)) return false;
        seen.add(m.type);
        return true;
    });
});

function modifierDesc(mod) {
    const meta = MODIFIER_META[mod.type];
    if (!meta) return '';
    if (mod.type === 'bomb') {
        const slots = mod.slots.map((s) => s + 1).join(' & ');
        return `Position${mod.slots.length > 1 ? 's' : ''} ${slots} — ${mod.fuseGuesses} guesses to defuse. Penalty: -${mod.penaltyAmount} guesses.`;
    }
    if (mod.type === 'ghost') {
        const slots = mod.slots.map((s) => s + 1).join(' & ');
        return `Position${mod.slots.length > 1 ? 's' : ''} ${slots} shifts every ${mod.shiftEvery} guesses.`;
    }
    if (mod.type === 'freeze') {
        const slots = mod.slots.map((s) => s + 1).join(' & ');
        return `Position${mod.slots.length > 1 ? 's' : ''} ${slots} — feedback hidden.`;
    }
    if (mod.type === 'lock') {
        const slots = mod.slots.map((s) => s + 1).join(' & ');
        return `Position${mod.slots.length > 1 ? 's' : ''} ${slots} — first guess locks forever.`;
    }
    if (mod.type === 'mirror') {
        const slots = mod.slots.map((s) => s + 1).join(' & ');
        return `Position${mod.slots.length > 1 ? 's' : ''} ${slots} — black/white feedback inverted.`;
    }
    return meta.desc;
}
</script>

<template>
    <div class="modal-backdrop" @click.self="emit('back')">
        <div class="modal-card" :style="{ '--zone-accent': zone?.accent }">
            <!-- Zone badge -->
            <div class="zone-badge">
                <span class="zone-emoji">{{ zone?.emoji }}</span>
                <span class="zone-label">Zone {{ level.zone }} — {{ zone?.name }}</span>
            </div>

            <!-- Level header -->
            <div class="level-header">
                <div class="level-number-badge" :class="{ boss: level.boss }">
                    {{ level.boss ? '👑' : level.id }}
                </div>
                <div>
                    <h2 class="level-title">{{ level.title }}</h2>
                    <p v-if="level.boss" class="boss-tag">Zone Boss</p>
                </div>
            </div>

            <!-- Flavour text -->
            <p class="flavour">{{ level.flavour }}</p>

            <!-- Config pills -->
            <div class="config-pills">
                <span class="pill">{{ level.config.codeLength }} pegs</span>
                <span class="pill">{{ level.config.colors.length }} colours</span>
                <span class="pill">{{ level.config.maxGuesses }} guesses</span>
            </div>

            <!-- Modifiers -->
            <div v-if="uniqueModifiers.length" class="modifiers-section">
                <p class="modifiers-label">Active modifiers</p>
                <div v-for="mod in uniqueModifiers" :key="mod.type" class="modifier-row">
                    <span class="modifier-emoji">{{ MODIFIER_META[mod.type]?.emoji }}</span>
                    <div class="modifier-text">
                        <span class="modifier-name">{{ MODIFIER_META[mod.type]?.label }}</span>
                        <span class="modifier-desc">{{ modifierDesc(mod) }}</span>
                    </div>
                </div>
            </div>

            <!-- Attempts + coins -->
            <div class="meta-row">
                <div class="attempts-pips">
                    <span
                        v-for="n in MAX_DAILY_ATTEMPTS"
                        :key="n"
                        class="attempt-pip"
                        :class="{ used: n > attemptsLeft }"
                    />
                    <span class="attempts-text">{{ attemptsLeft }} attempt{{ attemptsLeft !== 1 ? 's' : '' }} left today</span>
                </div>
                <div class="coins-display">
                    <span>🪙 {{ coins }}</span>
                </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
                <AppButton v-if="attemptsLeft > 0" size="lg" full @click="emit('play')">
                    Play Level {{ level.id }}
                </AppButton>
                <AppButton v-else size="lg" full disabled>
                    Come back tomorrow
                </AppButton>
                <AppButton variant="ghost" size="sm" full @click="emit('back')">Back to map</AppButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 100;
    padding: 0 0 env(safe-area-inset-bottom, 0);
    animation: fadeIn 0.2s ease;
}

.modal-card {
    background: var(--bg-primary);
    width: 100%;
    max-width: 480px;
    border-radius: 24px 24px 0 0;
    padding: 28px 24px 32px;
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-height: 90vh;
    overflow-y: auto;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
}

.zone-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
}

.zone-emoji { font-size: 1.1em; }

.zone-label {
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--zone-accent, #888);
}

.level-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.level-number-badge {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--zone-accent, #555);
    color: #fff;
    font-size: 1.2em;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.level-number-badge.boss {
    width: 60px;
    height: 60px;
    font-size: 1.5em;
    box-shadow: 0 0 0 3px var(--zone-accent, #555), 0 0 0 5px rgba(255,255,255,0.15);
}

.level-title {
    font-size: 1.4em;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
}

.boss-tag {
    font-size: 0.75em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--zone-accent, #888);
    margin-top: 2px;
}

.flavour {
    color: var(--text-secondary);
    font-size: 0.95em;
    line-height: 1.6;
    margin-bottom: 20px;
    font-style: italic;
}

.config-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.pill {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 0.8em;
    font-weight: 600;
    color: var(--text-secondary);
}

.modifiers-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 20px;
}

.modifiers-label {
    font-size: 0.72em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-bottom: 10px;
}

.modifier-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 8px;
}

.modifier-row:last-child { margin-bottom: 0; }

.modifier-emoji { font-size: 1.2em; flex-shrink: 0; margin-top: 1px; }

.modifier-text { display: flex; flex-direction: column; gap: 1px; }

.modifier-name {
    font-weight: 700;
    font-size: 0.9em;
    color: var(--text-primary);
}

.modifier-desc {
    font-size: 0.8em;
    color: var(--text-secondary);
    line-height: 1.4;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.attempts-pips {
    display: flex;
    align-items: center;
    gap: 6px;
}

.attempt-pip {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--zone-accent, #555);
    transition: background 0.2s;
}

.attempt-pip.used {
    background: var(--border-color);
}

.attempts-text {
    font-size: 0.8em;
    color: var(--text-secondary);
    margin-left: 4px;
}

.coins-display {
    font-size: 0.9em;
    font-weight: 700;
    color: var(--text-primary);
}

.modal-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
