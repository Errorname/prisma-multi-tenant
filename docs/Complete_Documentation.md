# Complete Documentation

Prisma-multi-tenant uses a "**management**" datasource in order to keep track of all the tenants of your application.

Thanks to this management datasource, prisma-multi-tenant is able to migrate all your tenants, as well as providing you with a simple way to access the data of whichever tenant you want.

Prisma-multi-tenant is a two-part project:

- The [CLI](#CLI) that you will use to init, develop and deploy your tenants
- The [Library](#Library) that you will use in your app to access the data in your tenants

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
  - [`help`](#help)
- [Library](#library)
  - [`constructor`](#constructoroptions-multitenantoptions)
  - [`get`](#getname-string-options-any-promiseprismaclient)
  - [`directGet`](#directgettenant--name-string-url-string--options-any-promiseprismaclient)
  - [`createTenant`](#createtenanttenant--name-string-provider-string-url-string--options-any-promiseprismaclient)
  - [`deleteTenant`](#deletetenantname-string-promisevoid)
  - [`existsTenant`](#existstenantname-string-promiseboolean)
  - [`disconnect`](#disconnect-promisevoid)

## CLI

### `init`

Init multi-tenancy for your application

**Options**

| Name     | Type   | Description                     |
| -------- | ------ | ------------------------------- |
| provider | String | Type of the management provider |
| url      | String | URL of the management database  |

**Examples**

```sh
prisma-multi-tenant init
prisma-multi-tenant init --provider=sqlite --url=file:management.db
```

**Explanations**

The `init` command is used to initialize your application to use `prisma-multi-tenant`. It will do the following:

1. Install `prisma-multi-tenant` locally in your app _(in order to use the library)_
2. Prompt for the management datasource (provider and url)
3. Update the `prisma/.env` file with the management's provider and url
4. Generate PrismaClient (for tenants & management)
5. Set up the management datasource
6. Create first tenant based on the `DATABASE_URL` env variable
7. Create an example script (`multi-tenancy-example.js`)

> Note: Make sure you are using `DATABASE_URL` in your schema.prisma

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

The `list` command connects to the management datasource and returns all the tenants in it. You can use the `--json` argument to retrieve a machine-readable format of your tenants for any use-case you want.

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
| provider      | String  | Provider of the tenant                                           |
| url           | String  | URL of the database                                              |
| no-management | Boolean | The new tenant will not be registered in the management database |

**Examples**

```sh
prisma-multi-tenant new
prisma-multi-tenant new --name=company_b --provider=postgresql --url=postgres://...
prisma-multi-tenant new --no-management
prisma-multi-tenant new management
```

**Explanations**

The `new` command create a new database using your schema. It will use a name, a provider and an url (that you can provide as options).

If you want to create a tenant without tracking it in the management datasource, you can use `--no-management`. However be careful, because you will need to manually migrate up and down this tenant after that.

If you add the `management` argument, you can create a new management database. If you want to use this new management, don't forget to add the provider and url in the `prisma/.env` file.

### `studio`

Use Studio to access a tenant

**Arguments**

| Name | Optional | Description                           |
| ---- | -------- | ------------------------------------- |
| name | **No**   | Name of the tenant you want to access |

**Options**

| Name | Type   | Description             |
| ---- | ------ | ----------------------- |
| port | Number | Port to start Studio on |

**Examples**

```sh
prisma-multi-tenant studio your_tenant_name
prisma-multi-tenant studio your_other_tenant --port=5556
```

**Explanations**

The `studio` command will connect to the management datasource to retrieve the url of the tenant given as an argument. If you want to run multiple studios, you can pass a specific `--port` option.

### `migrate`

Migrate up, down or save tenants.

> Note: You can also migrate up the management datasource to deploy another management database: `prisma-multi-tenant migrate management up -- --create-db`

**Arguments**

| Name   | Optional | Description                               |
| ------ | -------- | ----------------------------------------- |
| name   | Yes      | Name of the tenant you want to migrate    |
| action | **No**   | Migrate `up`, `down` or `save` the tenant |

**Examples**

```sh
prisma-multi-tenant migrate your_tenant_name down
prisma-multi-tenant migrate up
prisma-multi-tenant migrate save
prisma-multi-tenant migrate your_other_tenant up -- --auto-approve
prisma-multi-tenant migrate management up -- --create-db
```

**Explanations**

The `migrate` command is a wrapper to the `prisma2 migrate` command. If you pass the `name` argument, it will migrate a single tenant. Otherwise, it will apply the action to all of the tenants registered in the management datasource.

Any arguments written after `--` will be passed to `prisma2 migrate`.

### `delete`

Delete one tenant

**Arguments**

| Name | Optional | Description                           |
| ---- | -------- | ------------------------------------- |
| name | **No**   | Name of the tenant you want to delete |

**Options**

| Name  | Type    | Description                            |
| ----- | ------- | -------------------------------------- |
| force | Boolean | If true, will not ask for confirmation |

**Examples**

```sh
prisma-multi-tenant delete your_other_tenant
prisma-multi-tenant delete your_other_tenant --force
```

**Explainations**

The `delete` command will migrate down the tenant datasource and unregister it from the management datasource.

### `generate`

Generate Prisma Clients for the tenants and management

**Options**

| Name  | Type    | Description                     |
| ----- | ------- | ------------------------------- |
| watch | Boolean | Watches the Prisma project file |

**Examples**

```sh
prisma-multi-tenant generate
prisma-multi-tenant generate --watch
```

**Explainations**

The `generate` command generates the Prisma Client package for both Tenants and Management.

### `env`

Set env variables for a specific tenant

**Arguments**

| Name | Optional | Description                             |
| ---- | -------- | --------------------------------------- |
| name | **No**   | Name of the tenant you want in your env |

**Examples**

```sh
prisma-multi-tenant env your_tenant_name -- prisma2 migrate save --experimental
```

**Explanations**

The `env` command uses management to add the URL of your tenant in the `DATABASE_URL` env variable. Because of that, you can use any `prisma2` command you want, and it will use the tenant you specified.

### `help`

Displays the global help

**Example**

```sh
prisma-multi-tenant help
```

## Library

### `constructor(options?: MultiTenantOptions)`

Constructor of the `MultiTenant` class.

**Usage (JavaScript)**

```js
const { MultiTenant } = require('prisma-multi-tenant')

const multiTenant = new MultiTenant()
```

**Usage (TypeScript)**

This will give you autocompletion on your tenants

```ts
const { PrismaClient } = require('@prisma/client')
const { MultiTenant } = require('prisma-multi-tenant')

const multiTenant = new MultiTenant<PrismaClient>()
```

**No management**

If you do not want to connect to the Management database when connecting to a new Tenant, you can add the `useManagement: false` option:

```js
const multiTenant = new MultiTenant({
  useManagement: false
})
```

### `get(name: string, options?: any): Promise<PrismaClient>`

Returns the PrismaClient of your tenant. Any options passed as second argument will be given to the PrismaClient constructor.

This method connects to management, and will throw an error if the tenant is not in the local cache and the useManagement constructor's option is set to false.

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
  url: 'file:something.db'
})

const users = await prisma.user.findMany()

console.log(users)
```

### `createTenant(tenant: { name: string, provider: string, url: string }, options?: any): Promise<PrismaClient>`

Creates a new tenant in management and returns the corresponding PrismaClient. Any options passed as second argument will be given to the PrismaClient constructor.

This method will migrate up the new database to be up-to-date with the migrations.

> Note: You currently can't have tenants from multiple datasources. (See #8)

**Usage**

```js
const prisma = await multiTenant.createTenant({
  name: 'a_new_tenant',
  provider: 'postgresql',
  url: 'postgresql://the_postgres_url'
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
