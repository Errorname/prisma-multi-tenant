<h1 align="center">Blitz plugin for Prisma-multi-tenant 🧭</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/@prisma-multi-tenant/blitz">
    <img alt="Version" src="https://img.shields.io/npm/v/@prisma-multi-tenant/blitz.svg">
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

> 🧭 Add multi-tenancy to your [Blitz](https://blitzjs.com/) application

## Installation

```sh
npm i -g prisma-multi-tenant # CLI for tenant management
npm i @prisma-multi-tenant/blitz # Blitz plugin

prisma-multi-tenant init # Init multi-tenancy in your Blitz project
```

## Usage

⚠️ **First, make sure you followed the Prisma-multi-tenant [Getting Started](https://github.com/Errorname/prisma-multi-tenant/blob/master/docs/Getting_Started.md) Guide.** ⚠️

First, add the `multiTenantMiddleware` to your `blitz.config.js` file:

```js
const { multiTenantMiddleware } = require('@prisma-multi-tenant/blitz')

module.exports = {
  // ...
  middleware: [
    multiTenantMiddleware((req, res) => {
      // The name can come from anywhere (headers, token, ...)
      return 'dev' // or 'my_tenant_A' or anything
    }),
  ],
}
```

> Note: Restart the server after modifying `blitz.config.js`

Then, in your queries and mutations, access the tenant from the context:

```js
export default async function getProjects(args, ctx) {
  const projects = await ctx.db.project.findMany(args)

  return projects
}
```

## Example

Check out an example application using Blitz and the multi-tenant plugin [here](https://github.com/Errorname/prisma-multi-tenant/tree/master/docs/examples/blitz).

## Documentation

Read more on how `prisma-multi-tenant` can help you achieve multi-tenancy for your apps:

- ✨ [**Getting Started**](/docs/Getting_Started.md) ✨
- [Complete documentation](/docs/Complete_Documentation.md)
- [How to integrate with:](/docs/integrations)
  - [Express](/docs/integrations/Express.md)
  - [Apollo](/docs/integrations/Apollo.md)
  - [Blitz](/docs/integrations/Blitz.md)
  - [Redwood](/docs/integrations/Redwood.md)
  - Bison (TODO)
- [Examples](/docs/examples)
  - [Basic (JS)](/docs/examples/basic-js)
  - [Basic (TS)](/docs/examples/basic-ts)
  - [Express](/docs/examples/express)
  - [Apollo](/docs/examples/apollo)
  - [Blitz](/docs/examples/blitz)
  - [Redwood](/docs/examples/redwood)
  - Bison (TODO)
- [Issues with Vercel](/docs/Vercel.md)
- [Contributing guide](/docs/Contributing_Guide.md)

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
