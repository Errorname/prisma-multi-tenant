import { Command, CommandArguments } from '../../shared/types'
import { spawn } from 'child_process'
import management from '../management'

class Env implements Command {
  name = 'env'
  args = [
    {
      name: 'name',
      description: 'Name of the tenant you want in your env'
    }
  ]
  description = 'Set env variables for a specific tenant'

  async execute(args: CommandArguments) {
    const [name] = args.args

    const tenant = await management.getTenant(name)

    process.env.PMT_URL = tenant.url

    console.log(`\n  Running \`${args.secondary}\` on tenant "${name}"\n`)

    const [command, ...commandArguments] = args.secondary.split(' ')

    spawn(command, commandArguments, {
      stdio: 'inherit'
    }).on('exit', (exitCode: number) => process.exit(exitCode))
  }
}

export default new Env()
