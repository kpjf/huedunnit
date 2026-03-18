<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth.js';
import AppButton from '../components/AppButton.vue';

const { register, isLoading, error } = useAuth();

const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const localError = ref('');

const nameValid = computed(() => name.value.trim().length >= 2);
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
const passwordValid = computed(() => password.value.length >= 6);
const canSubmit = computed(() => nameValid.value && emailValid.value && passwordValid.value && !isLoading.value);

async function handleSubmit() {
    localError.value = '';
    if (!nameValid.value) {
        localError.value = 'Name must be at least 2 characters.';
        return;
    }
    if (!emailValid.value) {
        localError.value = 'Please enter a valid email address.';
        return;
    }
    if (!passwordValid.value) {
        localError.value = 'Password must be at least 6 characters.';
        return;
    }
    try {
        await register({ name: name.value.trim(), email: email.value, password: password.value });
    } catch {
        // error is exposed via the store
    }
}

const appName = import.meta.env.VITE_APP_NAME || 'App';
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <RouterLink to="/" class="logo-link">
                <img src="/images/logo.svg" class="logo" alt="HEXCode" />
            </RouterLink>
            <h1>{{ appName }}</h1>
            <h2>Create an account</h2>

            <form @submit.prevent="handleSubmit" novalidate>
                <div class="field">
                    <label for="name">Name</label>
                    <input
                        id="name"
                        v-model="name"
                        type="text"
                        autocomplete="name"
                        placeholder="Your name"
                        :disabled="isLoading"
                    />
                </div>

                <div class="field">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        placeholder="you@example.com"
                        :disabled="isLoading"
                    />
                </div>

                <div class="field">
                    <label for="password">Password</label>
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

                <p v-if="localError || error" class="error-msg">{{ localError || error }}</p>

                <AppButton type="submit" :full="true" :disabled="!canSubmit" class="submit-btn">
                    <span v-if="isLoading">Creating account…</span>
                    <span v-else>Sign Up</span>
                </AppButton>

                <p class="switch-link">
                    Already have an account?
                    <RouterLink to="/login">Sign in</RouterLink>
                </p>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--bg-primary);
}

.login-card {
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
