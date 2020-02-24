import chalk from 'chalk'

import { Command, CommandArguments } from '../../shared/types'
import prompt from '../helpers/prompt'
import Management from '../../shared/management'
import migrate from './migrate'
import { PmtError } from '../../shared/errors'

class New implements Command {
  name = 'new'
  altNames = ['add']
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
    },
    {
      name: 'no-management',
      description: 'The new tenant will not be registered in the management database',
      boolean: true
    }
  ]
  description = 'Create a new tenant'

  async execute(args: CommandArguments, management: Management) {
    console.log()
    const tenant = await prompt.tenantConf(args)

    if (tenant.name == 'management') {
      throw new PmtError('reserved-tenant-name', 'management')
    }

    await migrate.migrateTenant('up', tenant, '--create-db')

    if (args.options['no-management']) {
      console.log(
        chalk`\n✅  {green Created the new tenant (without management) and migrated up the database}\n`
      )
      return
    }

    await management.create(tenant)

    console.log(
      chalk`\n✅  {green Registered the new tenant into management and migrated up the database!}\n`
    )
  }
}

export default new New()
