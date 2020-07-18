import { Management, runDistantPrisma } from '@prisma-multi-tenant/shared'

import { Command, CommandArguments } from '../types'
import chalk from 'chalk'
import { log } from 'console'

class Studio implements Command {
  name = 'studio'
  args = [
    {
      name: 'name',
      optional: false,
      description: 'Name of the tenant you want to access',
    },
  ]
  options = [
    {
      name: 'port',
      description: 'Port to start Studio on',
    },
  ]
  description = 'Use Studio to access a tenant'

  async execute(args: CommandArguments, management: Management) {
    const [name] = args.args
    const port = args.options.port || '5555'

    console.log(`\n  Studio started for tenant "${name}" at http://localhost:${port}\n`)

    const tenant = await management.read(name)

    try {
      await runDistantPrisma(
        `studio --port ${port} ${args.secondary} --experimental`,
        tenant,
        false
      )
    } catch (e) {
      if (e.message.includes('EADDRINUSE')) {
        console.log(chalk.red(`  The port for studio is already being used, try another one:`))
        console.log(`  > prisma-multi-tenant studio ${name} --port ${Number(port) + 1}\n`)
      } else {
        throw e
      }
    }
  }
}

export default new Studio()
