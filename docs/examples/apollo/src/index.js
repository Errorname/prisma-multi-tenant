const { ApolloServer } = require('apollo-server')

const { typeDefs } = require('./schema')
const resolvers = require('./resolvers')
const { createContext } = require('./multi-tenant')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
})

server.listen().then(({ url }) => {
  console.log(`\n  🚀  Server ready at ${url}`)
})
