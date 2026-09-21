import { ApolloServer } from '@apollo/server'
import express from 'express'
import { resolvers } from './graphql/resolvers.js'
import { expressMiddleware } from '@as-integrations/express5'
import { readFile } from 'node:fs/promises'
import cors from 'cors'

const app = express()

const PORT = 4000

const typeDefs = await readFile(new URL('./graphql/schema.graphql', import.meta.url), 'utf8')

const graphqlServer = new ApolloServer({ typeDefs, resolvers })

await graphqlServer.start()

app.use(express.json())
app.use(
    cors({
        origin: 'http://localhost:3000',
    }),
)

app.use('/graphql', expressMiddleware(graphqlServer))

app.get('/', (req, res) => {
    res.json({
        message: 'Tech Graph API is running',
    })
})

app.listen(PORT, () => {
    console.log(`Server started at Port ${PORT}`)
    console.log(`Graphql Server started`)
})
