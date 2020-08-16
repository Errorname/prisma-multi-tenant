# Basic example (TS) for Prisma-multi-tenant

This is an example project written in TypeScript to run Prisma and Prisma-multi-tenant.

## Installation

```sh
npm install
```

Run the example script:

```sh
npm run example
```

Then, go to `multi-tenancy-example.js`, and change the tenant name to `"prod"`:

```js
const name = 'prod'
```

Finally, re-run the script!

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
