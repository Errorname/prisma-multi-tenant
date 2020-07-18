<h1 align="center">Nexus plugin for Prisma-multi-tenant 🧭</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/@prisma-multi-tenant/nexus">
    <img alt="Version" src="https://img.shields.io/npm/v/@prisma-multi-tenant/nexus.svg">
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

> 🧭 Add multi-tenancy to your Nexus/Prisma application

## Installation

```sh
npm i -g prisma-multi-tenant # CLI for tenant management
npm i @prisma-multi-tenant/nexus # Nexus plugin

prisma-multi-tenant init # Init multi-tenancy in your Nexus project
```

## Usage

⚠️ **First, make sure you followed the Prisma-multi-tenant [Getting Started](https://github.com/Errorname/prisma-multi-tenant/blob/master/docs/Getting_Started.md) Guide.** ⚠️

```js
import { use } from 'nexus'
import { prismaMultiTenant } from '@prisma-multi-tenant/nexus'

const tenantRouter = (req) => {
  // The name can come from anywhere (headers, token, ...)
  return 'my_tenant_A'
}

use(prismaMultiTenant({ tenantRouter }))
```

Since `@prisma-multi-tenant/nexus` is a wrapper of `nexus-plugin-prisma`, you can also pass along any settings accepted by `nexus-plugin-prisma`. (See [documentation](https://nexusjs.org/pluginss/prisma#plugin-settings))

```js
use(
  prismaMultiTenant({
    tenantRouter,
    features: { crud: true },
  })
)
```

## Example

Check out an example application using Nexus and the multi-tenant plugin [here](https://github.com/Errorname/prisma-multi-tenant/tree/master/docs/examples/nexus).

## Documentation

Read more on how `prisma-multi-tenant` can help you achieve multi-tenancy for your apps:

- [Getting Started](/docs/Getting_Started.md) - For newcomers
- [Complete documentation](/docs/Complete_Documentation.md) - For curious people
- [Contributing guide](/docs/Contributing_Guide.md) - For great people
- [Examples](/docs/examples) - For everyone
  - [Basic (JS)](/docs/examples/basic-js)
  - [Basic (TS)](/docs/examples/basic-ts)
  - [Nexus](/docs/examples/nexus)
  - Redwood (TODO)
  - Blitz (TODO)
- [Usage with Nexus](/packages/nexus)
- [Issues with Vercel](/docs/Vercel.md)

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
