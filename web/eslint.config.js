import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import svelteConfig from './svelte.config.js';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.{js,ts,mjs}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2022,
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLDialogElement: 'readonly',
        HTMLSpanElement: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        KeyboardEvent: 'readonly',
        ReadableStream: 'readonly',
        ReadableStreamDefaultReader: 'readonly',
        TextDecoder: 'readonly',
        TextEncoder: 'readonly',
        EventSource: 'readonly',
        EventSourceInit: 'readonly',
        alert: 'readonly',
        getComputedStyle: 'readonly',
        requestAnimationFrame: 'readonly',
        history: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        svelteConfig,
        sourceType: 'module',
        ecmaVersion: 2022,
        extraFileExtensions: ['.svelte'],
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileList: 'readonly',
        DataTransfer: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLDialogElement: 'readonly',
        HTMLSpanElement: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        KeyboardEvent: 'readonly',
        ReadableStream: 'readonly',
        ReadableStreamDefaultReader: 'readonly',
        TextDecoder: 'readonly',
        TextEncoder: 'readonly',
        EventSource: 'readonly',
        EventSourceInit: 'readonly',
        alert: 'readonly',
        getComputedStyle: 'readonly',
        requestAnimationFrame: 'readonly',
        history: 'readonly',
        color: 'readonly', // for icon props
      },
    },
    plugins: {
      svelte: sveltePlugin,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'svelte/valid-compile': ['error', { ignoreWarnings: true }],
      'no-inner-declarations': 'off', // Common in Svelte components
      'no-irregular-whitespace': 'off', // 全角スペースを許容
    },
  },
  {
    ignores: ['node_modules/**', '.svelte-kit/**', 'build/**', 'dist/**', '*.d.ts'],
  },
];
