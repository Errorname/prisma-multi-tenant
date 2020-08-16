# Adding multi-tenancy to your Apollo app

This document is a **tutorial** giving step by step instructions on how to add multi-tenancy to your [Apollo Server](https://www.apollographql.com/docs/apollo-server/) application, using [Prisma-multi-tenant](https://github.com/Errorname/prisma-multi-tenant).

👉 Before starting, we assume you already have an Apollo Server application, as well as an initialized instance of [Prisma](https://www.prisma.io/).

## Step 1: Initialize Prisma-multi-tenant

Download, then run the Prisma-multi-tenant CLI.

```sh
npm i -g prisma-multi-tenant

prisma-multi-tenant init
```

After following the instructions, you will now have a management database set up.

## Step 2: Instantiate the MultiTenant object

```js
const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant()
```

## Step 3: Write a context creator

```js
async function createContext({ req }) {
  // Retrieve the name of the tenant any way you want (headers, token, ...)
  // Try with "prod" !
  const name = 'dev'

  // Retrieve the Prisma Client of the tenant
  const tenant = await multiTenant.get(name)

  // Add the tenant to the context, to be used in resolvers
  return {
    db: tenant,
  }
}
```

Then, add it to your Apollo Server instance:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
})
```

## Step 4: Use the tenant in your resolvers

```js
const resolvers = {
  Query: {
    // Use the tenant to query the users
    users: (parent, args, ctx) => ctx.db.user.findMany(),
  },
}
```

---

And that's done! 🎉

Try adding a new tenant and play between them!

```sh
pmt new # Creates a new tenant

pmt list # List your existing tenants

# Access studio to the given tenant
pmt studio my_tenantA
pmt studio my_tenantB
```

---

If you have any issues with Prisma-multi-tenant, don't hesitate to [create an issue on Github](https://github.com/Errorname/prisma-multi-tenant/issues/new)
