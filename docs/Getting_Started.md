# Getting Started

Welcome to `prisma-multi-tenant`!

In this documentation, you will follow a step-by-step tutorial on how to add multi-tenancy to your application and how to develop and deploy on your tenants.

**Table of content:**

- [0. How does Prisma-multi-tenant works](#0-how-does-prisma-multi-tenant-works)
- [1. Install Prisma-multi-tenant](#1-install-prisma-multi-tenant)
- [2. Initialize multi-tenancy to in your app](#2-initialize-multi-tenancy-to-in-your-app)
- [3. Add a new tenant](#3-add-a-new-tenant)
- [4. Open Studio for a tenant](#4-open-studio-for-a-tenant)
- [5. Use the library to access your tenants](#5-use-the-library-to-access-your-tenants)
- [6. Watch and generate Prisma Clients](#6-watch-and-generate-prisma-clients)
- [7. Deploy your schema on all tenants at once](#7-deploy-your-schema-on-all-tenants-at-once)

## 0. How does Prisma-multi-tenant works

Prisma-multi-tenant uses a "**management**" datasource in order to keep track of all the tenants of your application.

Thanks to this management datasource, prisma-multi-tenant is able to migrate all your tenants, as well as providing you with a simple way to access the data of whichever tenant you want.

Prisma-multi-tenant is a two-part project:

- The **CLI** (`prisma-multi-tenant`) that you will use to init, develop, and deploy your tenants
- The **Client** (`@prisma-multi-tenant/client`) that you will use in your app to access the data in your tenants

## 1. Install Prisma-multi-tenant

Before using any of them, you will first need to install globally `prisma-multi-tenant`, here is how you do it (using npm or yarn):

```sh
npm install -g prisma-multi-tenant
# OR
yarn global add prisma-multi-tenant
```

## 2. Initialize multi-tenancy to in your app

Now that `prisma-multi-tenant` is available globally on your system, you can use it to initialize your application:

```sh
# In your application directory:
prisma-multi-tenant init
```

> Note: You can either use the command line `prisma-multi-tenant` or its alias: `pmt`. Example: `pmt init`

Running this command will do the following:

1. Installs `@prisma-multi-tenant/client` in your app
2. Prompts for the management datasource url
3. Updates the `prisma/.env` file with the management's url
4. Generates PrismaClient (for tenants & management)
5. Sets up the management datasource
6. Creates first tenant based on the `DATABASE_URL` env variable
7. Creates an example script (`multi-tenancy-example.js`)

> Note: Make sure you are using `DATABASE_URL` in the default datasource of your schema.prisma file

## 3. Add a new tenant

Following the `init` command, you have a first tenant, your initial datasource.

Let's add another one:

```sh
prisma-multi-tenant new
```

You now have two tenants!

To list them, you can run the following command:

```sh
prisma-multi-tenant list
```

## 4. Open Studio for a tenant

Now that you have two tenants, you want to access them and put some data in it.

You will do that by running Studio using **the name of one of your tenant**:

```sh
prisma-multi-tenant studio your_tenant_name
```

If you want to open another studio instance for your other tenant, you can specify the port:

```sh
prisma-multi-tenant studio your_other_tenant --port=5556
```

## 5. Use the library to access your tenants

If you want to know how to use the library to access the tenants in your application, checkout the file `multi-tenancy-example.js` that was added to your project.

It can be split in 3 parts:

**a. Instantiating MultiTenant**

```js
const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant()
```

**b. Get the tenant**

The name can come from anywhere (headers, token, ...)

```js
const prisma = await multiTenant.get('your_tenant_name')
```

**c. Use PrismaClient as usual**

```js
const users = await prisma.user.findMany()

console.log(users)
```

You can access any tenant you want, simply by using their name!

> Note: You are responsible to provide the environment variable for management any way you want

## 6. Watch and generate Prisma Clients

To watch and generate Prisma Clients, run the following command:

```sh
prisma-multi-tenant generate --watch
```

## 7. Deploy your schema on all tenants at once

If you want to make changes to your schema and migrate all your tenants at the same time, you can do it using the following command:

```sh
prisma-multi-tenant migrate up
```

---

And that's it!

You should now have everything you need to write your multi-tenant application 🥳

Check out the [Complete Documentation](/docs/Complete_Documentation.md) for a more in-depth documentation on the CLI and the library
