import { Command, Tenant } from '../types'
import inquirer from 'inquirer'

import management from '../management'
import { prompt, run, errors } from '../utils'

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

    await run('prisma2 lift up', conf)

    await management.photon.tenants.create({ data: conf })

    await run('node prisma/seed.js', conf)

    console.log(`\n✅  Added the new datasource into management!\n`)
  }
}

export default new New()
