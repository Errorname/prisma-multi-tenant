# Complete Documentation

Prisma-multi-tenant uses a "**management**" datasource in order to keep track of all the tenants of your application.

Thanks to this management datasource, prisma-multi-tenant is able to migrate all your tenants at once, as well as providing you with a simple way to access the data of whichever tenant you want.

Prisma-multi-tenant is a two-part project:

- The [CLI](#CLI) (`prisma-multi-tenant`) that you will use to init, develop, and deploy your tenants
- The [Client](#Client) (`@prisma-multi-tenant/client`) that you will use in your app to access the data in your tenants

There are also plugins for Prisma-powered frameworks:

- The [Blitz plugin](#blitz-plugin) (`@prisma-multi-tenant/blitz`) which adds multi-tenancy to your Blitz application.
- The [Redwood plugin](#redwood-plugin) (`@prisma-multi-tenant/redwood`) which adds multi-tenancy to your Redwood application.

**Table of content:**

- [CLI](#cli)
  - [`init`](#init)
  - [`list`](#list)
  - [`new`](#new)
  - [`studio`](#studio)
  - [`migrate`](#migrate)
  - [`delete`](#delete)
  - [`generate`](#generate)
  - [`env`](#env)
  - [`eject`](#eject)
  - [`help`](#help)
- [Client](#client)
  - [`constructor`](#constructoroptions-multitenantoptions)
  - [`get`](#getname-string-options-any-promiseprismaclient)
  - [`directGet`](#directgettenant--name-string-url-string--options-any-promiseprismaclient)
  - [`createTenant`](#createtenanttenant--name-string-url-string--options-any-promiseprismaclient)
  - [`deleteTenant`](#deletetenantname-string-promisevoid)
  - [`existsTenant`](#existstenantname-string-promiseboolean)
  - [`disconnect`](#disconnect-promisevoid)
- [Blitz plugin](#blitz-plugin)
  - [`multiTenantMiddleware`](#multiTenantMiddlewaretenantRouter-function-prismaoptions-prismaclientoptions-middleware)
- [Redwood plugin](#redwood-plugin)
  - [`fromContext`](#fromcontext-prismaclient)

## CLI

> Note: You can run the CLI with either `prisma-multi-tenant` or `pmt`. Example: `pmt init`

### `init`

Init multi-tenancy for your application

**Options**

| Name       | Type    | Description                      |
| ---------- | ------- | -------------------------------- |
| url        | String  | URL of the management database   |
| schema     | String  | Specify path of schema           |
| no-example | Boolean | Disable creation of example file |

**Examples**

```sh
prisma-multi-tenant init
prisma-multi-tenant init --url=file:management.db
prisma-multi-tenant init --schema db/schema.prisma
```

**Explanations**

The `init` command is used to initialize your application to use `prisma-multi-tenant`. It will do the following:

1. Install `@prisma-multi-tenant/client` locally in your app
2. Prompt for the management datasource url
3. Update the `prisma/.env` file with the management's url
4. Generate PrismaClient (for tenants & management)
5. Set up the management datasource
6. Create first tenant based on the `DATABASE_URL` env variable
7. Create an example script (`multi-tenancy-example.js`)

> Note: Make sure you are using `DATABASE_URL` in the default datasource of your schema.prisma file

### `list`

List all tenants

**Options**

| Name | Type    | Description             |
| ---- | ------- | ----------------------- |
| json | Boolean | Print using JSON Format |

**Examples**

```sh
prisma-multi-tenant list
prisma-multi-tenant list --json
```

**Explanations**

The `list` command connects to the management datasource and returns all the tenants in it. You can use the `--json` argument to retrieve a machine-readable format of your tenants for any use case you want.

### `new`

Create a new tenant or management

**Arguments**

| Name       | Optional | Description             |
| ---------- | -------- | ----------------------- |
| management | Yes      | Create a new management |

**Options**

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| name          | String  | Name of the tenant                                               |
| url           | String  | URL of the database                                              |
| schema        | String  | Specify path of schema                                           |
| no-management | Boolean | The new tenant will not be registered in the management database |

**Examples**

```sh
prisma-multi-tenant new
prisma-multi-tenant new --name=company_b --url=postgres://...
prisma-multi-tenant new --no-management
prisma-multi-tenant new management
```

**Explanations**

The `new` command create a new database using your schema. It will use a name, and an url (that you can provide as options).

If you want to create a tenant without tracking it in the management datasource, you can use `--no-management`. However be careful, because you will need to manually migrate up and down this tenant after that.

If you add the `management` argument, you can create a new management database. If you want to use this new management, don't forget to add the url in the `prisma/.env` file.

### `studio`

Use Studio to access a tenant

**Arguments**

| Name | Optional | Description                           |
| ---- | -------- | ------------------------------------- |
| name | **No**   | Name of the tenant you want to access |

**Options**

| Name   | Type   | Description             |
| ------ | ------ | ----------------------- |
| port   | Number | Port to start Studio on |
| schema | String | Specify path of schema  |

**Examples**

```sh
prisma-multi-tenant studio your_tenant_name
prisma-multi-tenant studio your_other_tenant --port=5556
```

**Explanations**

The `studio` command will connect to the management datasource to retrieve the url of the tenant given as an argument. If you want to run multiple studios, you can pass a specific `--port` option.

### `migrate`

Migrate up, down, or save tenants.

> Note: You can also migrate up the management datasource to deploy another management database: `prisma-multi-tenant migrate management up -- --create-db`

**Arguments**

| Name   | Optional | Description                                |
| ------ | -------- | ------------------------------------------ |
| name   | Yes      | Name of the tenant you want to migrate     |
| action | **No**   | Migrate `up`, `down`, or `save` the tenant |

**Options**

| Name   | Type   | Description            |
| ------ | ------ | ---------------------- |
| schema | String | Specify path of schema |

**Examples**

```sh
prisma-multi-tenant migrate your_tenant_name down
prisma-multi-tenant migrate up
prisma-multi-tenant migrate save
prisma-multi-tenant migrate your_other_tenant up -- --auto-approve
prisma-multi-tenant migrate management up -- --create-db
```

**Explanations**

The `migrate` command is a wrapper to the `@prisma/cli migrate` command. If you pass the `name` argument, it will migrate a single tenant. Otherwise, it will apply the action to all of the tenants registered in the management datasource.

Any arguments written after `--` will be passed to `@prisma/cli migrate`.

The `save` action will use the default DATABASE_URL value if no `name` argument is given.

### `delete`

Delete one tenant

**Arguments**

| Name | Optional | Description                           |
| ---- | -------- | ------------------------------------- |
| name | **No**   | Name of the tenant you want to delete |

**Options**

| Name   | Type    | Description                            |
| ------ | ------- | -------------------------------------- |
| schema | String  | Specify path of schema                 |
| force  | Boolean | If true, will not ask for confirmation |

**Examples**

```sh
prisma-multi-tenant delete your_other_tenant
prisma-multi-tenant delete your_other_tenant --force
```

**Explanations**

The `delete` command will migrate down the tenant datasource and unregister it from the management datasource.

### `generate`

Generate Prisma Clients for the tenants and management

**Options**

| Name   | Type    | Description                     |
| ------ | ------- | ------------------------------- |
| schema | String  | Specify path of schema          |
| watch  | Boolean | Watches the Prisma project file |

**Examples**

```sh
prisma-multi-tenant generate
prisma-multi-tenant generate --watch
```

**Explanations**

The `generate` command generates the Prisma Client package for both Tenants and Management.

### `env`

Set env variables for a specific tenant

**Arguments**

| Name | Optional | Description                             |
| ---- | -------- | --------------------------------------- |
| name | **No**   | Name of the tenant you want in your env |

**Examples**

```sh
prisma-multi-tenant env your_tenant_name -- npx @prisma/cli migrate save --experimental
```

**Explanations**

The `env` command uses management to add the URL of your tenant in the `DATABASE_URL` env variable. Because of that, you can use any `@prisma/cli` command you want and it will use the tenant you specified.

### `eject`

Eject prisma-multi-tenant from your application

**Explanations**

The `eject` command can be used if you no longer need `prisma-multi-tenant` in your application. This command will uninstall `@prisma-multi-tenant/client`. It will not touch your databases as you may have important data in them.

### `help`

Displays the global help

**Example**

```sh
prisma-multi-tenant help
```

## Client

> Note: The client will try to read the `MANAGEMENT_URL` environment variables in `prisma/.env`, but you can also provide it yourself.

### `constructor(options?: MultiTenantOptions)`

Constructor of the `MultiTenant` class.

**Usage (JavaScript)**

```js
const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant()
```

**Usage (TypeScript)**

This will give you autocompletion on your tenants

```ts
const { PrismaClient } = require('@prisma/client')
const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant<PrismaClient>()
```

**No management**

If you do not want to connect to the Management database when connecting to a new Tenant, you can add the `useManagement: false` option:

```js
const multiTenant = new MultiTenant({
  useManagement: false,
})
```

### `get(name: string, options?: any): Promise<PrismaClient>`

Returns the PrismaClient of your tenant. Any options passed as second argument will be given to the PrismaClient constructor.

If the tenant is present in the local cache, this method will return it. Otherwise, if the `useManagement` constructor's option is set to `true`, it will try to find the tenant in the management database.

If the tenant couldn't be accessed (either because `useManagement: false` or because it doesn't exist), this method will throw an error.

**Usage**

```js
const prisma = await multiTenant.get('your_tenant_name')

const users = await prisma.users.findMany()

console.log(users)
```

### `directGet(tenant: { name: string, url: string }, options?: any): Promise<PrismaClient>`

Returns the PrismaClient of your tenant. Any options passed as second argument will be given to the PrismaClient constructor.

This method does not connect to management.

**Usage**

```js
const prisma = await multiTenant.directGet({
  name: 'your_other_tenant',
  url: 'file:something.db',
})

const users = await prisma.user.findMany()

console.log(users)
```

### `createTenant(tenant: { name: string, url: string }, options?: any): Promise<PrismaClient>`

Creates a new tenant in management and returns the corresponding PrismaClient. Any options passed as second argument will be given to the PrismaClient constructor.

This method will migrate up the new database to be up-to-date with the migrations.

**Usage**

```js
const prisma = await multiTenant.createTenant({
  name: 'a_new_tenant',
  url: 'postgresql://the_postgres_url',
})

const users = await prisma.user.findMany()

console.log(users)
```

### `deleteTenant(name: string): Promise<void>`

Delete a tenant in management.

This method will migrate down the database.

**Usage**

```js
await multiTenant.deleteTenant('my_tenant')
```

### `existsTenant(name: string): Promise<Boolean>`

Test if a tenant exists in management.

**Usage**

```js
await multiTenant.existsTenant('my_tenant')
```

### `disconnect(): Promise<void[]>`

Disconnects all PrismaClient instances (management & tenants)

**Usage**

```js
await multiTenant.disconnect()
```

## Blitz plugin

### `multiTenantMiddleware(tenantRouter: Function, prismaOptions?: PrismaClientOptions): Middleware`

Registers the middleware into Blitz. The `tenantRouter` function is required, and you can also provide `prismaOptions` to be passed to every Prisma Client instances used for the tenants.

**Usage**

In the `blitz.config.js` file:

```ts
const { multiTenantMiddleware } = require('@prisma-multi-tenant/blitz')

module.exports = {
  // ...
  middleware: [
    multiTenantMiddleware((req, res) => {
      // The name can come from anywhere (headers, token, ...)
      return 'my_tenant_A'
    }),
  ],
}
```

## Redwood plugin

### `fromContext(): PrismaClient`

Dynamically return the Prisma Client instance from the context. This replaces the generated code from Redwood.

**Usage**

In the `api/src/lib/db.js` file:

```js
import { MultiTenant, fromContext } from '@prisma-multi-tenant/redwood'

export const multiTenant = new MultiTenant()
export const db = fromContext()
```

Everywhere else:

```js
import { db } from 'src/lib/db'

//

db.post.findMany()
```
