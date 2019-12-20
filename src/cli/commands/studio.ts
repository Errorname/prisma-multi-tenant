import { Command, CommandArguments } from '../../shared/types'
import management from '../management'
import { runDistant } from '../../shared/shell'

class Studio implements Command {
  name = 'studio'
  args = [
    {
      name: 'name',
      optional: false,
      description: 'Name of the tenant you want to access'
    }
  ]
  options = [
    {
      name: 'port',
      description: 'Port to start Studio on'
    }
  ]
  description = 'Use Studio to access a tenant'

  async execute(args: CommandArguments) {
    const [name] = args.args
    const port = args.options.port || '5555'

    console.log(`\n  Studio started for tenant "${name}" at http://localhost:${port}\n`)

    const tenant = await management.getTenant(name)

    await runDistant(`prisma2 studio --port ${port} ${args.secondary}`, tenant)
  }
}

export default new Studio()
