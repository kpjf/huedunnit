import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        rules: {
            'indent': ['error', 4],
            'vue/html-indent': ['error', 4],
            'vue/script-indent': ['error', 4, { baseIndent: 1 }],
            'no-unused-vars': 'warn',
            'no-console': 'warn',
            'vue/multi-word-component-names': 'off',
        },
    },
    {
        files: ['**/*.vue'],
        rules: {
            // vue/script-indent handles indentation inside <script> blocks;
            // the base indent rule must be off to avoid conflicts.
            'indent': 'off',
        },
    },
];
