import { Command, CommandArguments } from '../../shared/types'
import { spawn } from 'child_process'
import Management from '../../shared/management'

class Dev implements Command {
  name = 'dev'
  args = [
    {
      name: 'name',
      description: 'Name of the tenant you want to dev on'
    }
  ]
  description = 'Run `prisma2 dev` on a specific tenant'

  async execute(args: CommandArguments, management: Management) {
    const [name] = args.args

    console.log(`\n  Running \`prisma2 dev\` on tenant "${name}"\n`)

    const tenant = await management.read(name)

    process.env.PMT_URL = tenant.url

    spawn('prisma2', ['dev'], {
      stdio: 'inherit'
    }).on('exit', (exitCode: number) => process.exit(exitCode))
  }
}

export default new Dev()
