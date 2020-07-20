const resolvers = {
  Query: {
    // Use the tenant to query the users
    users: (parent, args, ctx) => ctx.db.user.findMany(),
  },
}

module.exports = resolvers
