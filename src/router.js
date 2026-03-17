import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth.js';

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
        component: () => import('./pages/Login.vue'),
        meta: { requiresGuest: true },
    },
    {
        path: '/signup',
        component: () => import('./pages/Signup.vue'),
        meta: { requiresGuest: true },
    },
    {
        path: '/stats',
        component: () => import('./pages/Stats.vue'),
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

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
