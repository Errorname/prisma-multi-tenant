# Adding multi-tenancy to your Blitz app

This document is a **tutorial** giving step by step instructions on how to add multi-tenancy to your [Blitz](https://blitzjs.com/) application, using [Prisma-multi-tenant](https://github.com/Errorname/prisma-multi-tenant).

## Step 1: Initialize Prisma-multi-tenant

Download, then run the Prisma-multi-tenant CLI.

```sh
npm i -g prisma-multi-tenant

prisma-multi-tenant init
```

After following the instructions, you will now have a management database set up.

## Step 2: Add the Blitz multi-tenant package

```sh
npm i @prisma-multi-tenant/blitz
```

## Step 3: Update the Blitz config

Add the multi-tenant middleware into `blitz.config.js`

```js
const { multiTenantMiddleware } = require('@prisma-multi-tenant/blitz')

module.exports = {
  // ...
  middleware: [
    multiTenantMiddleware((req, res) => {
      // The name can come from anywhere (headers, token, ...)
      return 'dev' // or 'my_tenant_A' or anything
    }),
  ],
}
```

## Step 4: Access the tenant

In your queries and mutations, access the tenant from the context:

```js
export default async function getProjects(args, ctx) {
  const projects = await ctx.db.project.findMany(args)

  return projects
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

If you have any issues with Prisma-multi-tenant and its Blitz plugin, don't hesitate to [create an issue on Github](https://github.com/Errorname/prisma-multi-tenant/issues/new)
