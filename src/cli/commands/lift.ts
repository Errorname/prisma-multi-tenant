import { Command, Tenant } from '../types'

import management from '../management'
import { errors, run } from '../utils'

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
    },
    {
      name: '...',
      optional: true,
      secondary: true,
      description: 'Any args you want to pass to `prisma2 lift`'
    }
  ]
  description = 'Lift up or down all tenants'

  useManagement = true

  async execute(args: string[]) {
    let name
    if (!liftActions.includes(args[0])) {
      name = args.shift()
    }
    const [action, ...liftArgs] = args

    if (!liftActions.includes(action)) {
      errors.wrongLiftAction(action)
    }

    let tenants

    if (name) {
      const tenant: Tenant = await management.get(name)
      if (!tenant) {
        errors.tenantDoesNotExists(name)
      }

      tenants = [tenant]
    } else {
      tenants = await management.getAll()
    }

    const tenantsCountStr = `${tenants.length} tenant${tenants.length > 1 ? 's' : ''}`

    console.log(`\nStarting lifting ${action} ${tenantsCountStr}\n`)

    for (let tenant of tenants) {
      console.log(
        `> Lifting ${action} tenant "${tenant.name}" ` +
          (liftArgs.length > 0 ? `with the following args: "${liftArgs.join(' ')}"` : '')
      )
      await run(`prisma2 lift ${action} ${liftArgs.join(' ')}`, tenant)
      console.log('Done!\n')
    }

    console.log(`✅  Successfully lifted ${action} ${tenantsCountStr}\n`)
  }
}

export default new Lift()
