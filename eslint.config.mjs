import { defineConfig } from 'eslint/config';
import { configs } from '@croct/eslint-plugin';

export default defineConfig(
    configs.typescript.map(config => ({
        ...config,
        files: config.files ?? ['**/*.ts', '**/*.tsx'],
        ...(config.languageOptions === undefined
            ? {}
            : {languageOptions: {
                ...config.languageOptions,
                parserOptions: {
                    ...config.languageOptions.parserOptions,
                    projectService: config.languageOptions.parserOptions?.projectService === true
                        ? {allowDefaultProject: ['*.config.ts']}
                        : config.languageOptions.parserOptions?.projectService,
                },
            }}),
    })),
    {
        files: ['tsup.config.ts'],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'import-x/no-default-export': 'off',
        },
    },
);