import chalk from 'chalk'

import { Command, CommandArguments } from '../../shared/types'
import { runLocalPrisma, runDistantPrisma, spawnShell } from '../../shared/shell'
import { setManagementProviderInSchema } from '../../shared/env'

class Generate implements Command {
  name = 'generate'
  args = []
  options = [
    {
      name: 'watch',
      description: 'Watches the Prisma project file',
      boolean: true
    }
  ]
  description = 'Generate Prisma Clients for the tenants and management'

  async execute(args: CommandArguments) {
    if (!args.options.watch) {
      console.log('\n  Generating Prisma Clients for both management and tenants...')

      // 1. Generate Tenants Prisma Client
      await this.generateTenants(args.secondary)

      // 2. Generate Management Prisma Client
      await this.generateManagement(args.secondary)

      console.log(chalk`\n✅  {green Prisma Clients have been generated!}\n`)
    } else {
      console.log('\n  Generating Prisma Client for management')

      await this.generateManagement(args.secondary)

      console.log(chalk`\n✅  {green Prisma Client for management has been generated!}\n`)

      console.log('\n  Generating and watching Prisma Client for tenants')

      await this.watchGenerateTenants(args.secondary)
    }
  }

  async generateTenants(prismaArgs: string = '') {
    await runDistantPrisma(`generate ${prismaArgs}`)
  }

  async generateManagement(prismaArgs: string = '') {
    // This is a workaround until Prisma allows for multi-provider datasources
    await setManagementProviderInSchema()

    await runLocalPrisma(`generate ${prismaArgs}`)
  }

  async watchGenerateTenants(prismaArgs: string = '') {
    spawnShell(`npx @prisma/cli generate --watch ${prismaArgs}`).then(exitCode =>
      process.exit(exitCode)
    )
  }
}

export default new Generate()
