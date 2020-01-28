import { Command, CommandArguments, Datasource } from '../../shared/types'
import { runLocal, runDistant } from '../../shared/shell'
import Management from '../../shared/management'
import { PmtError } from '../../shared/errors'
import chalk = require('chalk')

const migrateActions = ['up', 'down']

class Migrate implements Command {
  name = 'migrate'
  args = [
    {
      name: 'name',
      optional: true,
      description: 'Name of the tenant you want to migrate'
    },
    {
      name: migrateActions.join('|'),
      optional: false,
      description: 'Either migrate up or down the tenant'
    }
  ]
  description = 'Migrate up or down tenants'

  async execute(args: CommandArguments, management: Management) {
    const { name, action, migrateArgs, prismaArgs } = this.parseArgs(args)

    if (!name) {
      console.log(`\n  Migrating ${action} all tenants...\n`)

      await this.migrateAllTenants(management, action, migrateArgs, prismaArgs)

      console.log(chalk`\n✅  {green Successfuly migrated ${action} all tenants}\n`)
      return
    }

    if (name == 'management') {
      console.log(`\n  Migrating management ${action}...`)

      await this.migrateManagement(action, migrateArgs, prismaArgs)

      console.log(chalk`\n✅  {green Successfuly migrated ${action} management}\n`)
      return
    }

    console.log(`\n  Migrating "${name}" ${action}...`)

    await this.migrateOneTenant(management, action, name, migrateArgs, prismaArgs)

    console.log(chalk`\n✅  {green Successfuly migrated ${action} "${name}"}\n`)
  }

  parseArgs(args: CommandArguments) {
    const [arg1, arg2, ...restArgs] = args.args

    let name
    let action
    let migrateArgs

    if (migrateActions.includes(arg2)) {
      name = arg1
      action = arg2
      migrateArgs = restArgs.join(' ')
    } else if (migrateActions.includes(arg1)) {
      action = arg1
      migrateArgs = [arg2, ...restArgs].join(' ')
    } else {
      throw new PmtError('unrecognized-lift-action', args)
    }

    return { name, action, migrateArgs, prismaArgs: args.secondary }
  }

  async migrateOneTenant(
    management: Management,
    action: string,
    name: string,
    migrateArgs: string = '',
    prismaArgs: string = ''
  ) {
    const tenant = await management.read(name)

    return this.migrateTenant(action, tenant, migrateArgs, prismaArgs)
  }

  async migrateAllTenants(
    management: Management,
    action: string,
    migrateArgs: string = '',
    prismaArgs: string = ''
  ) {
    const tenants = await management.list()

    for (let tenant of tenants) {
      console.log(`    > Migrating "${tenant.name}" ${action}`)
      await this.migrateTenant(action, tenant, migrateArgs, prismaArgs)
    }
  }

  migrateTenant(
    action: string,
    tenant: Datasource,
    migrateArgs: string = '',
    prismaArgs: string = ''
  ) {
    return runDistant(
      `prisma2 migrate ${action} ${migrateArgs} ${prismaArgs} --experimental`,
      tenant
    )
  }

  migrateManagement(action: string, migrateArgs: string = '', prismaArgs: string = '') {
    return runLocal(`prisma2 migrate ${action} ${migrateArgs} ${prismaArgs} --experimental`)
  }
}

export default new Migrate()
