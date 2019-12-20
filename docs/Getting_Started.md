# Getting Started

Welcome to `prisma-multi-tenant`!

In this documentation, we will follow a step-by-step tutorial on how to add multi-tenancy to your application, and how to develop and deploy on your tenants.

**Table of content:**

- [0. How does Prisma-multi-tenant works](#0-how-does-prisma-multi-tenant-works)
- [1. Install Prisma-multi-tenant](#1-install-prisma-multi-tenant)
- [2. Initialize multi-tenancy to in your app](#2-initialize-multi-tenancy-to-in-your-app)
- [3. Add a new tenant](#3-add-a-new-tenant)
- [4. Open Studio for a tenant](#4-open-studio-for-a-tenant)
- [5. Use the library to access your tenants](#5-use-the-library-to-access-your-tenants)
- [6. Execute any prisma2 command on a given tenant](#6-execute-any-prisma2-command-on-a-given-tenant)
- [7. Deploy your schema on all tenants at once](#7-deploy-your-schema-on-all-tenants-at-once)

## 0. How does Prisma-multi-tenant works

Prisma-multi-tenant uses a "**management**" datasource in order to keep track of all the tenants of your application.

Thanks to this management datasource, prisma-multi-tenant is able to lift all your tenants, as well as providing you with a simple way to access your data.

Prisma-multi-tenant is a two-part project:

- The **CLI** that you will use to init, develop and deploy your tenants
- The **library** that you will use in your app to access the data in your tenants

## 1. Install Prisma-multi-tenant

Before using any of them, we will first need to install globally `prisma-multi-tenant`, here is how you do it (using npm or yarn):

```sh
npm install -g prisma-multi-tenant@alpha
# OR
yarn global add prisma-multi-tenant@alpha
```

## 2. Initialize multi-tenancy to in your app

Now that `prisma-multi-tenant` is available globally on your system, we can now use it to initialize your application:

```sh
# In your application directory:
prisma-multi-tenant init
```

Running this command will do the following:

1. Install `prisma-multi-tenant` locally in your app _(in order to use the library)_
2. Prompt for the management datasource (provider and url)
3. Update the Prisma Schema for multi-tenancy
4. Generate Photon (for tenants & management)
5. Set up the management datasource
6. Create first tenant based on your initial schema
7. Create an example script (`multi-tenancy-example.js`)

## 3. Add a new tenant

Following the `init` command, you have a first tenant, your initial datasource.

Let's add another one:

```sh
prisma-multi-tenant add
```

You now have two tenants!

To list them, you can run the following command:

```sh
prisma-multi-tenant list
```

## 4. Open Studio for a tenant

Now that you have two tenants, we want to access them and put some data in it.

We will do that by running Studio using **the name of one of your tenant**:

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

**1. Instantiating MultiTenant**

```js
const { MultiTenant } = require('prisma-multi-tenant')

const multiTenant = new MultiTenant()
```

**2. Get the tenant**

```js
const photon = await multiTenant.get('your_tenant_name')
```

**3. Use Photon as usual**

```js
const users = await photon.users.findMany()

console.log(users)
```

You can access any tenant you want, simply by using their name!

## 6. Execute any prisma2 command on a given tenant

Prisma-multi-tenant can be used as a wrapper to the `Prisma2` CLI.

For example, if you want to run `prisma2 dev` on a specific tenant, you can do the following:

```sh
prisma-multi-tenant env your_tenant_name -- prisma2 dev
```

## 7. Deploy your schema on all tenants at once

If you want to make changes to your schema, and lift all your tenants at the same time you can do it using the following command:

```sh
prisma-multi-tenant lift up
```

---

And that's it!

You should now have everything you need to write your multi-tenant application 🥳

Check out the [Complete Documentation](/docs/Complete_Documentation.md) for a more in-depth documentation on the CLI and the library
