<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import StoryModeHub from '../components/StoryModeHub.vue';
import LevelIntroModal from '../components/LevelIntroModal.vue';
import { useStoryMode } from '../game/useStoryMode.js';

const router = useRouter();
const { progress, getLevelState, getStars, getAttemptsToday, canAttempt, syncFromServer } = useStoryMode();

const selectedLevel = ref(null);

function handleSelectLevel(level) {
    selectedLevel.value = level;
}

function handlePlay() {
    if (!selectedLevel.value) return;
    router.push({ path: '/game', query: { type: 'story', level: selectedLevel.value.id } });
}

function handleBack() {
    selectedLevel.value = null;
}

onMounted(() => {
    syncFromServer();
});
</script>

<template>
    <div class="story-page">
        <StoryModeHub
            :get-level-state="getLevelState"
            :get-stars="getStars"
            :get-attempts-today="getAttemptsToday"
            :coins="progress.coins ?? 0"
            @select-level="handleSelectLevel"
            @back="router.push('/')"
        />

        <LevelIntroModal
            v-if="selectedLevel"
            :level="selectedLevel"
            :attempts-used="getAttemptsToday(selectedLevel.id)"
            :coins="progress.coins ?? 0"
            @play="handlePlay"
            @back="handleBack"
        />
    </div>
</template>

<style scoped>
.story-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>
