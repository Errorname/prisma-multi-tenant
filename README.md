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

> **Note:** This package works with `Prisma2`, if you want the `Prisma1` version, checkout [prisma-multi-tenant@1.0.3](https://github.com/Errorname/prisma-multi-tenant/tree/v1.0.3)

**What's a multi-tenant application?**

A [multi-tenant](https://en.wikipedia.org/wiki/Multitenancy) application is when a single instance of your application runs on a server and serves multiple tenants.

> With a multi-tenant architecture, a software application is designed to provide every tenant a dedicated share of the instance - including its data, configuration, user management, tenant individual functionality and non-functional properties.

For example, you could run a social-network for companies, where each company would have it's own data and users.

**Why is Prisma great for multi-tenancy?**

Prisma gives you all the tools necessary to handle your database: data modeling, database schema migrations, type-safe database access, etc. Doing so, we can then automate those processes and help you make a multi-tenant application.

**Why do I need `prisma-multi-tenant`?**

Because `prisma-multi-tenant` does not only allow you to access multiple databases seamlessly with only a couple of lines of code in your server, but it also let you use the CLI to create new tenants and assure consistancy between all your databases as easily as possible.

## Install

```sh
npm i -g prisma-multi-tenant
```

## Usage

> If this is your first time using `prisma-multi-tenant`, I **strongly suggest** that you follow the [Getting Started](/docs/Getting_Started.md) tutorial.

```
$> prisma-multi-tenant help

  🧭  prisma-multi-tenant v2.0.0-alpha2

  USAGE

    prisma-multi-tenant [command] [args]

    Examples:
        prisma-multi-tenant new
        prisma-multi-tenant lift my_tenant up
        prisma-multi-tenant env my_tenant -- prisma2 dev
        ...

  COMMANDS

    init                      Init multi-tenancy for your project
    list                      List all tenants
    new                       Create a new tenant
    studio <name>             Use Studio to access a tenant
    lift <name?> <up|down>    Lift up or down tenants
    delete <name?>            Delete one or more tenants
    generate                  Generate Photon for the tenants and management
    env <name>                Set env variables for a specific tenant
    help                      Display this help

  OPTIONS

    -h, --help                Output usage information for a command
    -V, --version             Output the version number
    --verbose                 Print additional logs
```

## Documentation

Read more on how `prisma-multi-tenant` can help you achieve multi-tenancy for your apps:

- [Getting Started](/docs/Getting_Started.md) - For newcomers
- [Complete documentation](/docs/Complete_Documentation.md) - For curious people
- [Contributing guide](/docs/Contributing_Guide.md) - For great people
- [Examples](/examples) - For everyone
  - [Basic (JS) example]()
  - [Basic (TS) example]()
  - [Nexus example]()

## Author

👤 **Thibaud Courtoison**

- Twitter: [@Errorname\_](https://twitter.com/Errorname_)
- Github: [@Errorname](https://github.com/Errorname)
- Prisma's Slack: [@Errorname](https://app.slack.com/client/T0MQBS8JG/DBNJ479FU)

## 🤝 Contributors

🙌 Thanks to [@antoinecarat](https://github.com/antoinecarat) for the reviews of this library

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Errorname/prisma-multi-tenant/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [Thibaud Courtoison](https://github.com/Errorname).<br />
This project is [MIT](https://github.com/Errorname/prisma-multi-tenant/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
