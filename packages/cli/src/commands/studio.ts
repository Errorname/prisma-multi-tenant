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
    {
      name: 'schema',
      description: 'Specify path of schema',
    },
  ]
  description = 'Use Studio to access a tenant'

  async execute(args: CommandArguments, management: Management) {
    const [name] = args.args
    const port = args.options.port || '5555'

    console.log(`\n  Studio started for tenant "${name}" at http://localhost:${port}\n`)

    const tenant = await management.read(name)

    try {
      const schemaPath = args.options.schema || (await getSchemaPath())
      await runDistantPrisma(
        `studio --port ${port} --schema ${schemaPath} ${args.secondary} --experimental`,
        tenant,
        false
      )
    } catch (err) {
      // There is currently a bug with @prisma/cli where the studio error is malformed.
      // We will assume that if it throws with a code 7, it's an issue with the port.
      // See: https://github.com/prisma/prisma/issues/3309
      if (err.message.includes('EADDRINUSE') || err.code === 7) {
        console.log(chalk.red(`  The port for studio is already being used, try another one:`))
        console.log(`  > prisma-multi-tenant studio ${name} --port ${Number(port) + 1}\n`)
      } else {
        throw err
      }
    }
  }
}

export default new Studio()
