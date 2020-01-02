import { Command, CommandArguments } from '../../shared/types'
import prompt from '../helpers/prompt'
import Management from '../../shared/management'
import lift from './lift'
import chalk = require('chalk')
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
    /*
    Uncomment when we can have multiple providers for tenants (See #8)
    {
      name: 'provider',
      description: 'Type of the provider'
    },*/
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

    await lift.liftTenant('up', tenant, '--create-db')

    if (args.options['no-management']) {
      console.log(
        chalk`\n✅  {green Created the new tenant (without management) and lifted up the database}\n`
      )
      return
    }

    await management.create(tenant)

    console.log(
      chalk`\n✅  {green Registered the new tenant into management and lifted up the database!}\n`
    )
  }
}

export default new New()
