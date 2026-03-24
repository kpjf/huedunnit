<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { authApi } from '../utils/auth-client.js';
import AppButton from '../components/AppButton.vue';

const route = useRoute();

const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const error = ref('');
const success = ref(false);

const passwordValid = computed(() => password.value.length >= 6);
const passwordsMatch = computed(() => password.value === confirmPassword.value);
const canSubmit = computed(() => passwordValid.value && passwordsMatch.value && !isLoading.value);

const appName = import.meta.env.VITE_APP_NAME || 'App';

const token = route.query.token;

async function handleSubmit() {
    error.value = '';
    if (!token) {
        error.value = 'No reset token provided.';
        return;
    }
    if (!passwordValid.value) {
        error.value = 'Password must be at least 6 characters.';
        return;
    }
    if (!passwordsMatch.value) {
        error.value = 'Passwords do not match.';
        return;
    }
    isLoading.value = true;
    try {
        await authApi.resetPassword(token, password.value);
        success.value = true;
    } catch (err) {
        error.value = err.message || 'Password reset failed.';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="page">
        <div class="card">
            <RouterLink to="/" class="logo-link">
                <img src="/images/logo.svg" class="logo" alt="HEXCode" />
            </RouterLink>
            <h1>{{ appName }}</h1>

            <div v-if="success" class="success-state">
                <h2>Password reset!</h2>
                <p class="subtitle">Your password has been updated. You can now sign in with your new password.</p>
                <AppButton :full="true" tag="RouterLink" to="/login">Sign in</AppButton>
            </div>

            <template v-else>
                <h2>Reset password</h2>

                <form @submit.prevent="handleSubmit" novalidate>
                    <div class="field">
                        <label for="password">New password</label>
                        <div class="password-wrapper">
                            <input
                                id="password"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                placeholder="••••••••"
                                :disabled="isLoading"
                            />
                            <button
                                type="button"
                                class="toggle-password"
                                @click="showPassword = !showPassword"
                                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                            >
                                {{ showPassword ? 'Hide' : 'Show' }}
                            </button>
                        </div>
                    </div>

                    <div class="field">
                        <label for="confirm-password">Confirm new password</label>
                        <input
                            id="confirm-password"
                            v-model="confirmPassword"
                            :type="showPassword ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="••••••••"
                            :disabled="isLoading"
                        />
                    </div>

                    <p v-if="error" class="error-msg">{{ error }}</p>

                    <AppButton type="submit" :full="true" :disabled="!canSubmit" class="submit-btn">
                        <span v-if="isLoading">Resetting…</span>
                        <span v-else>Reset password</span>
                    </AppButton>

                    <p class="switch-link">
                        <RouterLink to="/login">Back to sign in</RouterLink>
                    </p>
                </form>
            </template>
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
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
    color: var(--text-primary);
    text-align: center;
}

h2 {
    margin: 0 0 1.5rem;
    font-size: 1rem;
    font-weight: 400;
    color: var(--text-secondary);
    text-align: center;
}

.success-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.success-state h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
}

label {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

input {
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.15s;
}

input:focus {
    border-color: var(--text-primary);
}

input:disabled {
    opacity: 0.5;
}

.password-wrapper {
    position: relative;
    display: flex;
}

.password-wrapper input {
    flex: 1;
    padding-right: 4rem;
}

.toggle-password {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
}

.toggle-password:hover {
    color: var(--text-primary);
}

.error-msg {
    color: #e05555;
    font-size: 0.85rem;
    margin: 0 0 0.75rem;
}

.submit-btn {
    margin-top: 0.5rem;
}

.switch-link {
    text-align: center;
    margin-top: 1.25rem;
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
