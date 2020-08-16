# Express example for Prisma-multi-tenant

This is an example project to run Express with multi-tenancy using Prisma-multi-tenant. (See also the tutorial "[Adding multi-tenancy to your Express app](/docs/integrations/Express.md)")

## Installation

```sh
npm install
```

Start the server, and go to http://localhost:4000

```sh
npm run start
```

Then, go to `multi-tenant.js`, and change the tenant name to `"prod"`:

```js
const name = 'prod'
```

Finally, re-start the server, and refresh the page!

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
