import { Management, runDistantPrisma, getSchemaPath } from '@prisma-multi-tenant/shared'

import { Command, CommandArguments } from '../types'
import chalk from 'chalk'

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
      altNames: ['p'],
      description: 'Port to start Studio on',
    },
  ]
  description = 'Use Studio to access a tenant'

  async execute(args: CommandArguments, management: Management) {
    console.log(args.options)

    const [name] = args.args
    const port = args.options.port || '5555'

    console.log(`\n  Studio started for tenant "${name}" at http://localhost:${port}\n`)

    const tenant = await management.read(name)

    try {
      const schemaPath = await getSchemaPath()
      await runDistantPrisma(
        `studio --port ${port} ${args.secondary} --experimental --schema ${schemaPath}`,
        tenant,
        false
      )
    } catch (err) {
      // There is currently a bug with @prisma/cli where the studio error is malformed.
      // We will assume that if it throws, its an issue with the port.
      if (err.message.includes('EADDRINUSE') || true) {
        console.log(chalk.red(`  The port for studio is already being used, try another one:`))
        console.log(`  > prisma-multi-tenant studio ${name} --port ${Number(port) + 1}\n`)
      } else {
        throw err
      }
    }
  }
}

export default new Studio()
