import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import express from 'express'
import { resolvers } from './graphql/resolvers.js'
import { expressMiddleware } from '@as-integrations/express5'
import { readFile } from 'node:fs/promises'
import cors from 'cors'
import { createContext, type Context } from './graphql/context.js'
import { connectRedis } from './lib/redis.js'
import { notFoundHandler } from './lib/middleware/notFoundHandler.js'
import { errorHandler } from './lib/middleware/errorHandler.js'
import { formatGraphQLError } from './lib/errors/formatGraphQLError.js'

const app = express()

const PORT = 4000

const typeDefs = await readFile(new URL('./graphql/schema.graphql', import.meta.url), 'utf8')

const graphqlServer = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: false,
    formatError: formatGraphQLError,
})

await graphqlServer.start()

app.use(express.json())
app.use(
    cors({
        origin: 'http://localhost:3000',
    }),
)

app.use(
    '/graphql',
    expressMiddleware(graphqlServer, {
        context: async ({ req }) => {
            return createContext(req)
        },
    }),
)
connectRedis().catch((err) => {
    console.error('OTP features are unavailable', err)
})

app.get('/', (req, res) => {
    res.json({
        message: 'Tech Graph API is running',
    })
})

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server started at Port ${PORT}`)
    console.log(`Graphql Server started`)
})
