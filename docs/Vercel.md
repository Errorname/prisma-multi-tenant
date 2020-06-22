# Issues with Vercel

If you try to deploy and use Prisma-multi-tenant on Vercel, you may encounter the following problems:

## Cannot find Query Engine / Migration Engine

**Error:**

When trying to programmatically create a new tenant, you may receive the following error:

```
"Command failed: \"/var/task/node_modules/@prisma/cli/build/index.js\" migrate up --create-db --experimental\nError: Could not find query-engine binary. Searched in /var/task/node_modules/@prisma/cli/query-engine-rhel-openssl-1.0.x and /var/task/node_modules/query-engine-rhel-openssl-1.0.x\n"
```

This is because Vercel did not bundle the query/migration engines in your app.

**Solution:**

In one of your JavaScript file, add the following lines to tell Now to bundle the engines with your app:

```js
import path from 'path'

path.join(__dirname, '../node_modules/@prisma/cli/migration-engine-rhel-openssl-1.0.x')
path.join(__dirname, '../node_modules/@prisma/cli/query-engine-rhel-openssl-1.0.x')
```

> You need to adapt the relative path based on where your JavaScript file is.

## No such file or directory

**Error:**

When trying to programmatically create a new tenant, you may receive the following error:

```
"Command failed: \"/var/task/node_modules/@prisma/cli/build/index.js\" migrate up --create-db --experimental\nError: ENOENT: no such file or directory, mkdir\n"
```

This is because Vercel did not bundle the `prisma/` folder in your app.

**Solution:**

In one of your JavaScript file, add the following lines to tell Vercel to bundle the `prisma/` folder with your app:

```js
import path from 'path'

path.join(__dirname, './prisma/')
```

> You need to adapt the relative path based on where your JavaScript file is.

## Task timed out after 10.01 seconds

**Error:**

When trying to programmatically create a new tenant, you may receive the following error:

```
502 Bad Gateway
Task timed out after 10.01 seconds
```

**Solution:**

Currently, we haven't found a solution for this issue yet, however, it seems that the migration was successfuly done, except for the "Migration" table.

Check [this issue](https://github.com/Errorname/prisma-multi-tenant/issues/28) if you want to contribute on finding a solution.
