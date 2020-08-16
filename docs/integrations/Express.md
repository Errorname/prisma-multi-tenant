# Adding multi-tenancy to your Express app

This document is a **tutorial** giving step by step instructions on how to add multi-tenancy to your [Express](https://expressjs.com/) application, using [Prisma-multi-tenant](https://github.com/Errorname/prisma-multi-tenant).

👉 Before starting, we assume you already have an Express application, as well as an initialized instance of [Prisma](https://www.prisma.io/).

## Step 1: Initialize Prisma-multi-tenant

Download, then run the Prisma-multi-tenant CLI.

```sh
npm i -g prisma-multi-tenant

prisma-multi-tenant init
```

After following the instructions, you will now have a management database set up.

## Step 2: Write the multi-tenant middleware

```js
const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant()

async function multiTenantMiddleware(req, res, next) {
  // Retrieve the name of the tenant any way you want (headers, token, ...)
  const name = req.subdomains[0] // https://abc.slack.com => "abc"

  // Retrieve the Prisma Client of the tenant
  const tenant = await multiTenant.get(name)

  // Keep the tenants for this request/response
  res.locals.prisma = tenant

  // Important, the `next()` instruction gives Express the control back on the execution of the request
  next()
}
```

## Step 3: Use the tenant in your routes

```js
app.get('/users', async (req, res) => {
  const users = await res.locals.prisma.user.findMany()

  res.send({ users })
})
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
