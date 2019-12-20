import chalk from 'chalk'

import { Command, CommandArguments } from '../../shared/types'
import { runLocal, runDistant } from '../helpers/shell'

class Generate implements Command {
  name = 'generate'
  args = []
  description = 'Generate Photon for the tenants and management'

  async execute(args: CommandArguments) {
    console.log('\n  Generating photon for both management and tenants...')
    // 1. Generate Tenants Photon
    await this.generateTenants(args.secondary)

    // 2. Generate Management Photon
    await this.generateManagement(args.secondary)

    console.log(chalk`\n✅  {green Photons have been generated!}\n`)
  }

  async generateTenants(prismaArgs: string = '') {
    await runDistant(`prisma2 generate ${prismaArgs}`)
  }

  async generateManagement(prismaArgs: string = '') {
    await runLocal(`prisma2 generate ${prismaArgs}`)
  }
}

export default new Generate()
