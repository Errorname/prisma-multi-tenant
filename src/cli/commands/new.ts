import chalk from 'chalk'

import { Command, CommandArguments } from '../../shared/types'
import prompt from '../helpers/prompt'
import Management from '../../shared/management'
import migrate from './migrate'
import { PmtError } from '../../shared/errors'

class New implements Command {
  name = 'new'
  altNames = ['add']
  args = [
    {
      name: 'management',
      optional: true,
      description: 'Create a new management'
    }
  ]
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
  description = 'Create a new tenant or management'

  async execute(args: CommandArguments, management: Management) {
    if (args.args[0] === 'management') {
      await this.newManagement(args)
    } else {
      await this.newTenant(args, management)
    }
  }

  async newManagement(args: CommandArguments) {
    console.log()
    const datasource = await prompt.managementConf(args)

    process.env.MANAGEMENT_PROVIDER = datasource.provider
    process.env.MANAGEMENT_URL = datasource.url

    await migrate.migrateManagement('up', '--create-db')

    console.log(chalk`\n✅  {green Successfuly created a new management database!}\n`)
  }

  async newTenant(args: CommandArguments, management: Management) {
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
