# Nexus Example for Prisma-multi-tenant

This is an example project to run Nexus with the Prisma-multi-tenant plugin.

## Installation

```sh
npm install
npm run dev
```

Go to https://localhost:4000 and try the following query:

```graphql
query {
  posts {
    id
    title
    body
    published
  }
}
```

Then, go to `api/app.ts`, and change the tenant name to `"prod"`:

```js
use(
  prismaMultiTenant({
    tenantRouter: () => 'prod',
  })
)
```

Finally, re-run the GraphQL query!

## Commands you can try

This will list the available tenants:

```sh
prisma-multi-tenant list
```

This will open studio for the tenants (dev & prod):

```sh
prisma-multi-tenant studio dev
prisma-multi-tenant studio prod
```

This will make you create a new tenant:

```sh
prisma-multi-tenant new
```
