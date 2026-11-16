import babelParser from '@babel/eslint-parser'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default [
    {
        ignores: ['node_modules/**', 'src/generated/**'],
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    presets: ['@babel/preset-typescript'],
                },
            },
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
]
