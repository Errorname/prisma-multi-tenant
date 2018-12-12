# prisma-multi-tenant

🧭 Use Prisma as a multi-tenant provider with Apollo Server or Yoga

**What's a multi-tenant application?**

A [multi-tenant](https://en.wikipedia.org/wiki/Multitenancy) application is when a single instance of your application runs on a server and serves multiple tenants.

> With a multi-tenant architecture, a software application is designed to provide every tenant a dedicated share of the instance - including its data, configuration, user management, tenant individual functionality and non-functional properties.

For example, you could run a social-network for companies, where each company would have it's own data and users.

**Why is Prisma great for multi-tenancy?**

Prisma handles **services** mapped to individual databases. You can use services to have multiple different applications, or your could create **a service for each of your tenant**.

A service is defined by a name and a stage. (e.g. `company_a/dev`, `company_a/prod`, `company_b/pre-prod`, `company_b/prod`)

**Why do I need `prisma-multi-tenant`?**

Because Prisma Client only handles a single service. If you want your GraphQL Server (Apollo or Yoga) to handle multiple services seamlessly, you should use `prisma-multi-tenant`!

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
    users: (_, args, ctx) => ctx.prisma.users(args)
  }
}
```

Then, from your backend, you can pass a `prisma-service` HTTP header with `[name]/[stage]` to your GraphQL operations to choose which service to target.

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

## Credits

🙌 Thanks to [@antoinecarat](https://github.com/antoinecarat) for the reviews of this library
