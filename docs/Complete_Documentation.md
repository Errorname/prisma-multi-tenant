# Complete Documentation

Prisma-multi-tenant uses a "**management**" datasource in order to keep track of all the tenants of your application.

Thanks to this management datasource, prisma-multi-tenant is able to lift all your tenants, as well as providing you with a simple way to access your data of whichever tenant you want.

Prisma-multi-tenant is a two-part project:

- The [CLI](#CLI) that you will use to init, develop and deploy your tenants
- The [Library](#Library) that you will use in your app to access the data in your tenants

**Table of content:**

- [CLI](#cli)
  - [`init`](#init)
  - [`list`](#list)
  - [`new`](#new)
  - [`studio`](#studio)
  - [`lift`](#lift)
  - [`delete`](#delete)
  - [`generate`](#generate)
  - [`env`](#env)
  - [`help`](#help)
- [Library](#library)
  - [`constructor`](#constructoroptions-multitenantoptions)
  - [`get`](#getname-string-options-any-promisephoton)
  - [`directGet`](#directgettenant--name-string-url-string--options-any-promisephoton)
  - [`createTenant`](#createtenanttenant--name-string-provider-string-url-string--options-any-promisephoton)
  - [`deleteTenant`](#deletetenantname-string-promisevoid)
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
3. Update the Prisma Schema for multi-tenancy
4. Generate Photon (for tenants & management)
5. Set up the management datasource
6. Create first tenant based on your initial schema
7. Create an example script (`multi-tenancy-example.js`)

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

Create a new tenant

**Options**

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| name          | String  | Name of the tenant                                               |
| url           | String  | URL of the database                                              |
| no-management | Boolean | The new tenant will not be registered in the management database |

**Examples**

```sh
prisma-multi-tenant new
prisma-multi-tenant new --name=company_b --url=postgres://...
prisma-multi-tenant new --no-management
```

**Explanations**

The `new` command create a new database using your schema. It will use a name and a url (that you can provide as options).

If you want to create a tenant without tracking it in the management datasource, you can use `--no-management`. However be careful, because you will need to manually lift up and down this tenant after that.

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

### `lift`

Lift up or down tenants

**Arguments**

| Name   | Optional | Description                           |
| ------ | -------- | ------------------------------------- |
| name   | Yes      | Name of the tenant you want to lift   |
| action | **No**   | Either lift `up` or `down` the tenant |

**Examples**

```sh
prisma-multi-tenant lift your_tenant_name down
prisma-multi-tenant lift up
prisma-multi-tenant lift your_other_tenant up -- --auto-approve
```

**Explanations**

The `lift` command is a wrapper to the `prisma2 lift` command. If you pass the `name` argument, it will lift a single tenant. Otherwise, it will apply the action to all of the tenants registered in the management datasource.

Any arguments written after `--` will be passed to `prisma2 lift`.

### `delete`

Delete one or more tenants

**Arguments**

|Name|Optional|Description|
|name|Yes|Name of the tenant you want to delete|

**Examples**

```sh
prisma-multi-tenant delete
prisma-multi-tenant delete your_other_tenant
```

**Explainations**

The `delete` command will lift down the tenant datasource and unregister it from the management datasource.

If you do not specify a tenant name as argument, it will do this for all registered tenants.

### `generate`

Generate Photon for the tenants and management

**Examples**

```sh
prisma-multi-tenant generate
```

**Explainations**

The `generate` command generates the Photon package for both Tenants and Management.

### `env`

Set env variables for a specific tenant

**Arguments**

| Name | Optional | Description                             |
| ---- | -------- | --------------------------------------- |
| name | **No**   | Name of the tenant you want in your env |

**Examples**

```sh
prisma-multi-tenant env your_tenant_name -- prisma2 dev
prisma-multi-tenant env your_other_tenant -- prisma2 lift save
```

**Explanations**

The `env` command uses management to add the URL of your tenant in the env variable. Because of that, you can use any `prisma2` command you want, and it will use the tenant you specified.

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
const { Photon } = require('@prisma/photon')
const { MultiTenant } = require('prisma-multi-tenant')

const multiTenant = new MultiTenant<Photon>()
```

**No management**

If you do not want to connect to the Management database when connecting to a new Tenant, you can add the `useManagement: false` option:

```js
const multiTenant = new MultiTenant({
  useManagement: false
})
```

### `get(name: string, options?: any): Promise<Photon>`

Returns the Photon of your tenant. Any options passed as second argument will be given to the Photon constructor.

This method connects to management, and will throw an error if the tenant is not in the local cache and the useManagement constructor's option is set to false.

**Usage**

```js
const photon = await multiTenant.get('your_tenant_name')

const users = await photon.users.findMany()

console.log(users)
```

### `directGet(tenant: { name: string, url: string }, options?: any): Promise<Photon>`

Returns the Photon of your tenant. Any options passed as second argument will be given to the Photon constructor.

This method does not connect to management.

**Usage**

```js
const photon = await multiTenant.directGet({
  name: 'your_other_tenant',
  url: 'file:something.db'
})

const users = await photon.users.findMany()

console.log(users)
```

### `createTenant(tenant: { name: string, provider: string, url: string }, options?: any): Promise<Photon>`

Creates a new tenant in management and returns the corresponding Photon. Any options passed as second argument will be given to the Photon constructor.

This method will lift up the new database to be up-to-date with the migrations.

> Note: You currently can't have tenants from multiple datasources. (See #8)

**Usage**

```js
const photon = await multiTenant.createTenant({
  name: 'a_new_tenant',
  provider: 'postgresql',
  url: 'postgresql://the_postgres_url'
})

const users = await photon.users.findMany()

console.log(users)
```

### `deleteTenant(name: string): Promise<void>`

Delete a tenant in management.

This method will lift down the database.

**Usage**

```js
await multiTenant.deleteTenant('my_tenant')
```

### `disconnect(): Promise<void[]>`

Disconnects all Photon instances (management & tenants)

**Usage**

```js
await multiTenant.disconnect()
```
