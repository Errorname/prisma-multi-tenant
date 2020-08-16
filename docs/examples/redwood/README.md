# Redwood example for Prisma-multi-tenant

This is an example project to run Redwood with the Prisma-multi-tenant plugin. (See also the tutorial "[Adding multi-tenancy to your Redwood app](/docs/integrations/Redwood.md)")

## Installation

```sh
yarn install
yarn redwood dev
```

Go to http://localhost:8910 and see the example posts.

Then, go to `api/src/functions/graphql.js`, and change the tenant name to `"prod"`:

```diff
export const handler = createGraphQLHandler({
  schema: makeMergedSchema({
    schemas,
    services: makeServices({ services }),
  }),
  context: async ({ event }) => ({
    // The name can come from anywhere (headers, token, ...)
    db: await multiTenant
-      .get('dev') // or 'my_tenant_A' or anything
+      .get('prod')
      .catch(console.error),
  }),
})
```

Finally, return see the posts at http://localhost:8910!

## Commands you can try

This will list the available tenants:

```sh
pmt list # or prisma-multi-tenant list
```

This will open studio for the tenants (dev & prod):

```sh
pmt studio dev
pmt studio prod
```

This will make you create a new tenant:

```sh
pmt new
```
