const { gql } = require('apollo-server')

const typeDefs = gql`
  type User {
    email: String!
    name: String
  }

  type Query {
    users: [User!]!
  }
`

module.exports = { typeDefs }
