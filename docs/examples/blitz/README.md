# Blitz example for Prisma-multi-tenant

This is an example project to run Blitz with the Prisma-multi-tenant plugin. (See also the tutorial "[Adding multi-tenancy to your Blitz app](/docs/integrations/Blitz.md)")

## Installation

```sh
npm install
npm run start
```

Go to http://localhost:3000/projects and see the list of projects.

Then, go to `blitz.config.js`, and change the tenant name to `"prod"`:

```js
multiTenantMiddleware((req) => {
  return "prod"
})
```

Finally, **restart the server** and return see the list of projects at http://localhost:3000/projects

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
