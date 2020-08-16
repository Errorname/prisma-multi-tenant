# Adding multi-tenancy to your Nexus app

This document is a **tutorial** giving step by step instructions on how to add multi-tenancy to your [Nexus](https://nexusjs.org/) application, using [Prisma-multi-tenant](https://github.com/Errorname/prisma-multi-tenant).

👉 Before starting, we assume you already have a Nexus application with the [Prisma plugin](https://nexusjs.org/pluginss/prisma).

## Step 1: Initialize Prisma-multi-tenant

Download, then run the Prisma-multi-tenant CLI.

```sh
npm i -g prisma-multi-tenant

prisma-multi-tenant init
```

After following the instructions, you will now have a management database set up.

## Step 2: Add the Nexus multi-tenant plugin

```sh
npm i @prisma-multi-tenant/nexus
```

## Step 3: Replace the Prisma plugin

In your `api/app.ts`, **remove the Prisma plugin**, and add the following:

```js
import { use } from 'nexus'
import { prismaMultiTenant } from '@prisma-multi-tenant/nexus'

const tenantRouter = (req) => {
  // The name can come from anywhere (headers, token, ...)
  return 'dev' // or 'my_tenant_A' or anything
}

use(prismaMultiTenant({ tenantRouter }))
```

The only required argument to the plugin is the `tenantRouter` function. This functions takes the `Request` and returns the name of the tenant that must be used during this request.

## Optional step: Add optional arguments

Since `@prisma-multi-tenant/nexus` is a wrapper of `nexus-plugin-prisma`, you can also pass along any settings accepted by `nexus-plugin-prisma`. (See [documentation](https://nexusjs.org/pluginss/prisma#plugin-settings))

```js
use(
  prismaMultiTenant({
    tenantRouter,
    features: { crud: true },
  })
)
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

If you have any issues with Prisma-multi-tenant and its Nexus plugin, don't hesitate to [create an issue on Github](https://github.com/Errorname/prisma-multi-tenant/issues/new)
