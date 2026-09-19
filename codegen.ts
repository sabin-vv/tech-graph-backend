import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    schema: './src/graphql/schema.graphql',

    generates: {
        './src/generated/graphql.ts': {
            plugins: ['typescript', 'typescript-resolvers'],
            config: {
                useIndexSignature: true,
                useTypeImports: true,
                scalars: {
                    DateTime: 'Date',
                },
                enumsAsConst: true,
            },
        },
    },
}

export default config
