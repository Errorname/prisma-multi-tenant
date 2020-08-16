# Adding multi-tenancy to your Redwood app

This document is a **tutorial** giving step by step instructions on how to add multi-tenancy to your [Redwood](https://redwoodjs.com/) application, using [Prisma-multi-tenant](https://github.com/Errorname/prisma-multi-tenant).

## Step 1: Initialize Prisma-multi-tenant

Download, then run the Prisma-multi-tenant CLI, from the `api/` directory.

```sh
npm i -g prisma-multi-tenant

cd api/

prisma-multi-tenant init
```

After following the instructions, you will have a management database set up.

## Step 2: Add the Redwood multi-tenant package

```sh
npm i @prisma-multi-tenant/redwood
```

## Step 3: Update the `db` lib

Replace the code in `api/src/lib/db.js` with the following:

```js
import { MultiTenant, fromContext } from '@prisma-multi-tenant/redwood'

export const multiTenant = new MultiTenant()
export const db = fromContext()
```

## Step 4: Add the database to the context

Update the code in `api/src/functions/graphql.js`:

```js
import { multiTenant } from 'src/lib/db'

export const handler = createGraphQLHandler({
  schema: makeMergedSchema({
    schemas,
    services: makeServices({ services }),
  }),
  context: async ({ event }) => ({
    // The name can come from anywhere (headers, token, ...)
    db: await multiTenant
      .get('dev') // or 'my_tenant_A' or anything
      .catch(console.error),
  }),
})
```

Finally, restart the server:

```
yarn redwood dev
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

If you have any issues with Prisma-multi-tenant and its Redwood plugin, don't hesitate to [create an issue on Github](https://github.com/Errorname/prisma-multi-tenant/issues/new)
