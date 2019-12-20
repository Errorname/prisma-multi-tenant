import { Command, CommandArguments, Datasource } from '../../shared/types'
import { runLocal, runDistant } from '../helpers/shell'
import { getManagementDatasource, getSchemaDir } from '../helpers/schema'
import management from '../management'
import { CliError } from '../helpers/errors'
import chalk = require('chalk')

const liftActions = ['up', 'down']

class Lift implements Command {
  name = 'lift'
  args = [
    {
      name: 'name',
      optional: true,
      description: 'Name of the tenant you want to lift'
    },
    {
      name: liftActions.join('|'),
      optional: false,
      description: 'Either lift up or down the tenant'
    }
  ]
  description = 'Lift up or down tenants'

  async execute(args: CommandArguments) {
    const { name, action, liftArgs, prismaArgs } = this.parseArgs(args)

    if (name) {
      console.log(`\n  Lifting "${name}" ${action}...`)

      await this.liftOneTenant(action, name, liftArgs, prismaArgs)

      console.log(chalk`\n✅  {green Successfuly lifted ${action} "${name}"}\n`)
      return
    }

    console.log(`\n  Lifting ${action} all tenants...\n`)

    await this.liftAllTenants(action, liftArgs, prismaArgs)

    console.log(chalk`\n✅  {green Successfuly lifted ${action} all tenants}\n`)
  }

  parseArgs(args: CommandArguments) {
    const [arg1, arg2, ...restArgs] = args.args

    let name
    let action
    let liftArgs

    if (liftActions.includes(arg2)) {
      name = arg1
      action = arg2
      liftArgs = restArgs.join(' ')
    } else if (liftActions.includes(arg1)) {
      action = arg1
      liftArgs = [arg2, ...restArgs].join(' ')
    } else {
      throw new CliError('unrecognized-lift-action', args)
    }

    return { name, action, liftArgs, prismaArgs: args.secondary }
  }

  async liftOneTenant(
    action: string,
    name: string,
    liftArgs: string = '',
    prismaArgs: string = ''
  ) {
    const tenant = await management.getTenant(name)

    return this.liftTenant(action, tenant, liftArgs, prismaArgs)
  }

  async liftAllTenants(action: string, liftArgs: string = '', prismaArgs: string = '') {
    const tenants = await management.getTenants()

    for (let tenant of tenants) {
      console.log(`    > Lifting "${tenant.name}" ${action}`)
      await this.liftTenant(action, tenant, liftArgs, prismaArgs)
    }
  }

  liftTenant(action: string, tenant: Datasource, liftArgs: string = '', prismaArgs: string = '') {
    return runDistant(`prisma2 lift ${action} ${liftArgs} ${prismaArgs}`, tenant)
  }

  liftManagement(action: string) {
    return runLocal(`prisma2 lift ${action} --create-db`)
  }
}

export default new Lift()
