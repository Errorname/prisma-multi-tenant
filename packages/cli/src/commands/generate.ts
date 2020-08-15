import chalk from 'chalk'

import {
  runDistantPrisma,
  runLocalPrisma,
  spawnShell,
  getSchemaPath,
} from '@prisma-multi-tenant/shared'

import { Command, CommandArguments } from '../types'

class Generate implements Command {
  name = 'generate'
  args = []
  options = [
    {
      name: 'schema',
      description: 'Specify path of schema',
    },
    {
      name: 'watch',
      description: 'Watches the Prisma project file',
      boolean: true,
    },
  ]
  description = 'Generate Prisma Clients for the tenants and management'

  async execute(args: CommandArguments) {
    if (!args.options.watch) {
      console.log('\n  Generating Prisma Clients for both management and tenants...')

      // 1. Generate Tenants Prisma Client
      await this.generateTenants(args.options.schema, args.secondary)

      // 2. Generate Management Prisma Client
      await this.generateManagement()

      console.log(chalk`\n✅  {green Prisma Clients have been generated!}\n`)
    } else {
      console.log('\n  Generating Prisma Client for management')

      await this.generateManagement()

      console.log(chalk`\n✅  {green Prisma Client for management has been generated!}\n`)

      console.log('\n  Generating and watching Prisma Client for tenants')

      await this.watchGenerateTenants(args.options.schema, args.secondary)
    }
  }

  async generateTenants(schemaPath?: string, prismaArgs?: string) {
    schemaPath = schemaPath || (await getSchemaPath())
    await runDistantPrisma(`generate --schema ${schemaPath} ${prismaArgs || ''}`)
  }

  async generateManagement() {
    await runLocalPrisma('generate')
  }

  async watchGenerateTenants(schemaPath?: string, prismaArgs?: string) {
    schemaPath = schemaPath || (await getSchemaPath())
    spawnShell(
      `npx @prisma/cli generate --schema ${schemaPath} --watch ${prismaArgs || ''}`
    ).then((exitCode) => process.exit(exitCode))
  }
}

export default new Generate()
