import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth.js';

import { usePostHog } from '@/composables/usePostHog';

// Auth routes render nothing — AuthDialog in App.vue handles the UI
const EmptyView = { render: () => null };

const routes = [
    {
        path: '/',
        component: () => import('./pages/Intro.vue'),
    },
    {
        path: '/game',
        component: () => import('./pages/Game.vue'),
    },
    {
        path: '/login',
        component: EmptyView,
        meta: { requiresGuest: true },
    },
    {
        path: '/signup',
        component: EmptyView,
        meta: { requiresGuest: true },
    },
    {
        path: '/forgot-password',
        component: EmptyView,
        meta: { requiresGuest: true },
    },
    {
        path: '/reset-password',
        component: EmptyView,
    },
    {
        path: '/stats',
        component: () => import('./pages/Stats.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/story',
        component: () => import('./pages/Story.vue'),
    },
    {
        path: '/verify-email',
        component: () => import('./pages/VerifyEmail.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const { posthog } = usePostHog();

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isInitialized) {
        await authStore.initialize();
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ path: '/login', query: { redirect: to.fullPath } });
    }

    if (to.meta.requiresRole && !authStore.hasPermission(to.meta.requiresRole)) {
        return next('/');
    }

    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        return next('/');
    }

    next();
});

export default router;
