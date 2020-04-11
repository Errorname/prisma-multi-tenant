<h1 align="center">Prisma-multi-tenant 🧭</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/prisma-multi-tenant">
    <img alt="Version" src="https://img.shields.io/npm/v/prisma-multi-tenant.svg">
  </a>
  <a href="https://github.com/Errorname/prisma-multi-tenant#readme">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
  </a>
  <a href="https://github.com/Errorname/prisma-multi-tenant/graphs/commit-activity">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" target="_blank" />
  </a>
  <a href="https://github.com/Errorname/prisma-multi-tenant/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
  <a href="https://twitter.com/Errorname_">
    <img alt="Twitter: Errorname_" src="https://img.shields.io/twitter/follow/Errorname_.svg?style=social" target="_blank" />
  </a>
</p>

> 🧭 Use Prisma as a multi-tenant provider for your application

**What's a multi-tenant application?**

A [multi-tenant](https://en.wikipedia.org/wiki/Multitenancy) application is when a single instance of your application runs on a server and serves multiple tenants.

> With a multi-tenant architecture, a software application is designed to provide every tenant a dedicated share of the instance - including its data, configuration, user management, tenant individual functionality and non-functional properties.

For example, you could run a social-network for companies, where each company would have it's own data and users.

**Why is Prisma great for multi-tenancy?**

Prisma gives you all the tools necessary to handle your database: data modeling, database schema migrations, type safe database access, etc. Doing so, `prisma-multi-tenant` can then automate those processes and help you make a multi-tenant application.

**Why do I need `prisma-multi-tenant`?**

Because `prisma-multi-tenant` does not only allow you to access multiple databases seamlessly with only a couple of lines of code in your server, but it also let you use the CLI to create new tenants and assure consistancy between all your databases as easily as possible.

## Install

```sh
npm i -g prisma-multi-tenant@beta
```

## Usage

> If this is your first time using `prisma-multi-tenant`, I **strongly suggest** that you follow the [**Getting Started**](/docs/Getting_Started.md) tutorial.

```
$> prisma-multi-tenant help

  🧭  prisma-multi-tenant v2.0.0-beta.2

  USAGE

    prisma-multi-tenant [command] [args]

    Examples:
        prisma-multi-tenant new
        prisma-multi-tenant migrate my_tenant up
        prisma-multi-tenant env my_tenant -- npx @prisma/cli instrospect
        ...

  COMMANDS

    init                       Init multi-tenancy for your application
    list                       List all tenants
    new <management?>          Create a new tenant or management
    studio <name>              Use Studio to access a tenant
    migrate <name?> <action>   Migrate tenants (up, down, save)
    delete <name>              Delete one tenant
    generate                   Generate Prisma Clients for the tenants and management
    env <name>                 Set env variables for a specific tenant
    eject                      Eject prisma-multi-tenant from your application
    help                       Display this help

  OPTIONS

    -h, --help                 Output usage information for a command
    -V, --version              Output the version number
    -e, --env                  Load env file given as parameter
    --verbose                  Print additional logs
```

```js
const { MultiTenant } = require('prisma-multi-tenant')

const multiTenant = new MultiTenant()

// The name can come from anywhere (headers, token, ...)
const prisma = await multiTenant.get('my_tenant_A')

// Use Prisma-Client the same way as before
const users = await prisma.user.findMany()

console.log(users)
```

## Documentation

Read more on how `prisma-multi-tenant` can help you achieve multi-tenancy for your apps:

- [Getting Started](/docs/Getting_Started.md) - For newcomers
- [Complete documentation](/docs/Complete_Documentation.md) - For curious people
- [Contributing guide](/docs/Contributing_Guide.md) - For great people
- [Examples](/docs/examples) - For everyone
  - [Basic (JS)](/docs/examples/basic-js)
  - [Basic (TS)](/docs/examples/basic-ts)
  - Nexus (Work in progress)
- [Issues with Zeit Now](/docs/Zeit_Now.md)

## Author

👤 **Thibaud Courtoison**

- Twitter: [@Errorname\_](https://twitter.com/Errorname_)
- Github: [@Errorname](https://github.com/Errorname)
- Prisma's Slack: [@Errorname](https://slack.prisma.io/)

## 🤝 Contributors

Contributions, issues, and feature requests are welcome! 🙌

Feel free to check [issues page](https://github.com/Errorname/prisma-multi-tenant/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [Thibaud Courtoison](https://github.com/Errorname).

This project is [MIT](https://github.com/Errorname/prisma-multi-tenant/blob/master/LICENSE) licensed.
