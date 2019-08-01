import { Command, Tenant } from '../../shared/types'

import management from '../management'
import { prompt, run, errors } from '../../shared'

class New implements Command {
  name = 'new'
  args = []
  options = [
    {
      name: 'name',
      description: 'Name of the tenant'
    },
    {
      name: 'provider',
      description: 'Type of the provider'
    },
    {
      name: 'url',
      description: 'URL of the database'
    }
  ]
  description = 'Create, deploy and seed a new tenant'

  useManagement = true

  async execute(args: string[]) {
    console.log()

    const { name, provider, url } = await prompt.tenantConf(args)

    if (await management.exists(name)) {
      errors.tenantAlreadyExists(name)
    }

    const conf: Tenant = { name, provider, url }

    try {
      await run('prisma2 lift up', conf).catch((e: Error) => {
        throw e
      })

      await management.photon.tenants.create({ data: conf }).catch((e: Error) => {
        throw e
      })

      await run(`node prisma/tenant-seed.js '${name}'`, conf).catch((e: Error) => {
        throw e
      })

      console.log(`\n✅  Added the new datasource into management and seeded the database!\n`)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }
}

export default new New()
