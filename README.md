# prisma-multi-tenant

🧭 Use Prisma as a multi-tenant provider with Apollo Server or Yoga

## Installation

```bash
npm install prisma-multi-tenant
```

## Basic usage

The following example is using `Prisma Client`. You will find instructions for `prisma-binding` after this example.

```js
/* In your backend's main file */
const MultiTenant = require('prisma-multi-tenant')
const Prisma = require('./generated/prisma-client').Prisma
const { ApolloServer } = require('apollo-server')

const multiTenant = new MultiTenant({
  instanciate: (name, stage) =>
    new Prisma({
      endpoint: `https://localhost:4000/${name}/${stage}`
    }),
  nameStageFromReq: req => req.headers['prisma-service'].split('/')
})

const server = new ApolloServer({
  /* ..., */
  context: ctx => ({
    ...ctx,
    prisma: multiTenant.current(ctx.req) // or ctx.request if you use GraphQL-Yoga
  })
})

/* In your resolvers */
module.exports = {
  Query: {
    users: (_, args, ctx, info) => ctx.prisma.query.users(args, info)
  }
}
```

Then, from your backend, you can pass a `prisma-service` HTTP header with the `[name]/[stage]` to your GraphQL operations to choose which service to target.

### With prisma-binding

If you use `prisma-binding`, you need to slightly change the previous code:

```js
const MultiTenant = require('prisma-multi-tenant')
const { Prisma } = require('prisma-binding')

const multiTenant = new MultiTenant({
  instanciate: (name, stage) =>
    new Prisma({
      typeDefs: './path/to/typedef.graphql',
      endpoint: `https://localhost:4000/${name}/${stage}`
    })
  /* ... */
})

/* ... */
```
