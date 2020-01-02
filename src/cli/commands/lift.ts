import { Command, CommandArguments, Datasource } from '../../shared/types'
import { runLocal, runDistant } from '../../shared/shell'
import Management from '../../shared/management'
import { PmtError } from '../../shared/errors'
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

  async execute(args: CommandArguments, management: Management) {
    const { name, action, liftArgs, prismaArgs } = this.parseArgs(args)

    if (!name) {
      console.log(`\n  Lifting ${action} all tenants...\n`)

      await this.liftAllTenants(management, action, liftArgs, prismaArgs)

      console.log(chalk`\n✅  {green Successfuly lifted ${action} all tenants}\n`)
      return
    }

    if (name == 'management') {
      console.log(`\n  Lifting management ${action}...`)

      await this.liftManagement(action, liftArgs, prismaArgs)

      console.log(chalk`\n✅  {green Successfuly lifted ${action} management}\n`)
      return
    }

    console.log(`\n  Lifting "${name}" ${action}...`)

    await this.liftOneTenant(management, action, name, liftArgs, prismaArgs)

    console.log(chalk`\n✅  {green Successfuly lifted ${action} "${name}"}\n`)
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
      throw new PmtError('unrecognized-lift-action', args)
    }

    return { name, action, liftArgs, prismaArgs: args.secondary }
  }

  async liftOneTenant(
    management: Management,
    action: string,
    name: string,
    liftArgs: string = '',
    prismaArgs: string = ''
  ) {
    const tenant = await management.read(name)

    return this.liftTenant(action, tenant, liftArgs, prismaArgs)
  }

  async liftAllTenants(
    management: Management,
    action: string,
    liftArgs: string = '',
    prismaArgs: string = ''
  ) {
    const tenants = await management.list()

    for (let tenant of tenants) {
      console.log(`    > Lifting "${tenant.name}" ${action}`)
      await this.liftTenant(action, tenant, liftArgs, prismaArgs)
    }
  }

  liftTenant(action: string, tenant: Datasource, liftArgs: string = '', prismaArgs: string = '') {
    return runDistant(`prisma2 lift ${action} ${liftArgs} ${prismaArgs}`, tenant)
  }

  liftManagement(action: string, liftArgs: string = '', prismaArgs: string = '') {
    return runLocal(`prisma2 lift ${action} ${liftArgs} ${prismaArgs}`)
  }
}

export default new Lift()
