<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authApi } from '../utils/auth-client.js';
import AppButton from '../components/AppButton.vue';

const route = useRoute();

const status = ref('loading'); // 'loading' | 'success' | 'error'
const errorMessage = ref('');

const appName = import.meta.env.VITE_APP_NAME || 'App';

onMounted(async () => {
    const token = route.query.token;
    if (!token) {
        status.value = 'error';
        errorMessage.value = 'No verification token provided.';
        return;
    }
    try {
        await authApi.verifyEmail(token);
        status.value = 'success';
    } catch (err) {
        status.value = 'error';
        errorMessage.value = err.message || 'Email verification failed.';
    }
});
</script>

<template>
    <div class="page">
        <div class="card">
            <RouterLink to="/" class="logo-link">
                <img src="/images/logo.svg" class="logo" alt="HEXCode" />
            </RouterLink>
            <h1>{{ appName }}</h1>

            <div v-if="status === 'loading'" class="state">
                <p class="subtitle">Verifying your email…</p>
            </div>

            <div v-else-if="status === 'success'" class="state">
                <h2>Email verified!</h2>
                <p class="subtitle">Your email address has been confirmed.</p>
                <AppButton :full="true" tag="RouterLink" to="/login">Sign in</AppButton>
            </div>

            <div v-else class="state">
                <h2>Verification failed</h2>
                <p class="error-msg">{{ errorMessage }}</p>
                <p class="switch-link">
                    <RouterLink to="/login">Back to sign in</RouterLink>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--bg-primary);
}

.card {
    width: 100%;
    max-width: 380px;
    padding: 2rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    text-align: center;
}

.logo-link {
    display: block;
    width: 80px;
    margin: 0 auto 1rem;
}

.logo {
    width: 100%;
    display: block;
    opacity: 0.9;
    transition: opacity 0.15s;
}

.logo-link:hover .logo {
    opacity: 1;
}

h1 {
    margin: 0 0 1.5rem;
    font-size: 1.5rem;
    color: var(--text-primary);
}

h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: var(--text-primary);
}

.state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
}

.error-msg {
    color: #e05555;
    font-size: 0.875rem;
    margin: 0;
}

.switch-link {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.switch-link a {
    color: var(--text-primary);
    font-weight: 600;
    text-decoration: none;
}

.switch-link a:hover {
    text-decoration: underline;
}
</style>
