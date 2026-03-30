import posthog from 'posthog-js';

export function usePostHog() {
    if (import.meta.env.PROD) {
        posthog.init('phc_FEbepfMmP33lHvvvvy0vnXtjwWInvXX3vTuDdw3JVo1', {
            api_host: 'https://us.i.posthog.com',
            defaults: '2026-01-30',
        });
    }

    return { posthog };
}
