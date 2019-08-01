import { Command } from '../../shared/types'
import chalk from 'chalk'

import { prompt, errors, run } from '../../shared'

import management from '../management'

class Delete implements Command {
  name = 'delete'
  args = [
    {
      name: 'name',
      optional: true,
      description: 'Name of the tenant you want to delete'
    }
  ]
  description = 'Delete one or all tenants'

  useManagement = true

  async execute([name]: string[]) {
    // Feature request: Delete databases as well

    console.log()
    if (name) {
      if (
        await prompt.confirm(chalk.red(`Are you sure you want to delete the "${name}" tenant?`))
      ) {
        const tenant = await management.get(name)
        if (!tenant) {
          errors.tenantDoesNotExists(name)
        }

        await run('prisma2 lift down', tenant)

        await management.photon.tenants.delete({ where: { name } })

        console.log('\n✅  Lifted down the datasource and deleted it from management!\n')
        console.log(chalk.red.bold('Note: You are still in charge of deleting the database!\n'))
        return
      }
    } else if (await prompt.confirm(chalk.red(`Are you sure you want to delete all tenants?`))) {
      const tenants = await management.getAll()

      await Promise.all(tenants.map(tenant => run('prisma2 lift down', tenant)))

      await management.photon.tenants.deleteMany({})

      console.log(
        `\n✅  Lifted down all (${tenants.length}) datasources and deleted them from management!\n`
      )
      console.log(chalk.red.bold('Note: You are still in charge of deleting the databases!\n'))
      return
    }
  }
}

export default new Delete()
