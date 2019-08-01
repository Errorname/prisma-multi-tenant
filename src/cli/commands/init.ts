import { Command } from '../../shared/types'

import { prompt } from '../../shared'

const prependFile = require('prepend-file')

class Init implements Command {
  name = 'init'
  args = []
  options = [
    {
      name: 'provider',
      description: 'Type of the provider'
    },
    {
      name: 'url',
      description: 'URL of the database'
    }
  ]
  description = 'Init multi-tenancy for your project'

  useManagement = false

  async execute(args: string[]) {
    console.log()

    const { provider, url } = await prompt.managementConf(args)

    const datasourceStr = `// The two following datasources (db and management) are REQUIRED for prisma-multi-tenant.
// PLEASE DO NOT REMOVE THEM

datasource db {
  provider = env("PMT_PROVIDER")
  url      = env("PMT_URL")
}

datasource management {
  provider = "${provider}"
  url      = "${url}"
}

// If there is datasources below this line, they will not be used by prisma2

`

    await new Promise((resolve, reject) => {
      prependFile(process.cwd() + '/prisma/schema.prisma', datasourceStr, (err: Error) => {
        if (err) reject(err)
        resolve()
      })
    })

    const seedStr = `const { MultiTenant } = require('prisma-multi-tenant')

const name = process.argv[2]
if (!name) {
  console.error('No tenant name given as argument')
  process.exit(0)
}

const multiTenant = new MultiTenant()

async function main() {
  const photon = await multiTenant.get(name)

  // This will create an user on your new tenant
  await photon.users.create({
    data: {
      name: 'Jane Doe',
      email: 'jane.doe@errorna.me'
    }
  })

  console.log('Seeding done!')
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await multiTenant.disconnect()
  })
`

    await new Promise((resolve, reject) => {
      prependFile(process.cwd() + '/prisma/tenant-seed.js', seedStr, (err: Error) => {
        if (err) reject(err)
        resolve()
      })
    })

    console.log(`\n✅  Added the datasources definitions into your schema.prisma file!\n`)
  }
}

export default new Init()
