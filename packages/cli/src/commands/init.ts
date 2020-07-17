import fs from 'fs'
import chalk from 'chalk'

import {
  Datasource,
  Management,
  runShell,
  readEnvFile,
  writeEnvFile,
  requireDistant,
} from '@prisma-multi-tenant/shared'

import { Command, CommandArguments } from '../types'
import { useYarn } from '../helpers/misc'
import prompt from '../helpers/prompt'

import generate from './generate'
import migrate from './migrate'

const packageJson = require('../../package.json')

class Init implements Command {
  name = 'init'
  args = []
  options = [
    {
      name: 'url',
      description: 'URL of the management database',
    },
  ]
  description = 'Init multi-tenancy for your application'

  async execute(args: CommandArguments, management: Management) {
    // 1. Install prisma-multi-tenant to the application
    await this.installPMT()

    // 2. Prompt management url
    const managementUrl = await this.getManagementDatasource(args)

    // 3. Update .env file
    const firstTenant = await this.updateEnvFile(managementUrl)

    // 4. Generate clients
    await this.generateClients()

    // 5. Set up management
    await this.setUpManagement()

    // 6. Create first tenant from initial env
    if (firstTenant) {
      await this.createFirstTenant(firstTenant, management)
    }

    // 7. Create multi-tenancy-example.js
    await this.createExample(firstTenant)

    console.log(chalk`\n✅  {green Your app is now ready for multi-tenancy!}\n`)
    console.log(chalk`  {bold Next step:} Create a new tenant with \`prisma-multi-tenant new\`\n`)
  }

  async installPMT() {
    console.log('\n  Installing `@prisma-multi-tenant/client` in your app...')

    // This is used for testing purposes
    if (process.env.PMT_TEST) {
      return runShell('npm link @prisma-multi-tenant/client').then(() =>
        runShell('npm link @prisma-multi-tenant/shared')
      )
    }

    const yarnOrNpm = (await useYarn()) ? 'yarn add' : 'npm install'

    return runShell(`${yarnOrNpm} @prisma-multi-tenant/client@${packageJson.version}`)
  }

  async getManagementDatasource(args: CommandArguments) {
    console.log(chalk`\n  {yellow We will now configure the management database:}\n`)

    const { url: managementUrl } = await prompt.managementConf(args)

    process.env.MANAGEMENT_URL = managementUrl

    return managementUrl
  }

  async updateEnvFile(managementUrl: string): Promise<Datasource | null> {
    const envFile = await readEnvFile()

    const envs = `

      # The following env variable is used by prisma-multi-tenant
      
      MANAGEMENT_URL=${managementUrl}
    `
      .split('\n')
      .map((x) => x.substr(6))
      .join('\n')

    await writeEnvFile(envFile + envs)

    const url = process.env.DATABASE_URL

    if (!url) {
      console.error(chalk`\n  {red Couldn't find DATABASE_URL env variable}`)
      return null
    }

    return {
      name: 'dev',
      url,
    }
  }

  async generateClients() {
    console.log('\n  Generating prisma clients for both management and tenants...')

    await generate.generateTenants()
    await generate.generateManagement()
  }

  setUpManagement() {
    console.log('\n  Setting up management database...')

    return migrate.migrateManagement('up', '--create-db')
  }

  async createFirstTenant(firstTenant: Datasource, management: Management) {
    console.log('\n  Creating first tenant from your initial schema...')

    await management.create(firstTenant)
  }

  async createExample(firstTenant: Datasource | null) {
    console.log('\n  Creating example script...')

    const { dmmf } = requireDistant('@prisma/client')

    const firstModelMapping = dmmf.mappings[0]

    // We should use singular name (See prisma/prisma-client-js#509)
    const modelNamePlural = firstModelMapping.plural
    const modelNameSingular = firstModelMapping.model.toLowerCase()

    const script = `
      // const { PrismaClient } = require('@prisma/client') // Uncomment for TypeScript support
      const { MultiTenant } = require('@prisma-multi-tenant/client')

      // This is the name of your first tenant, try with another one
      const name = "${firstTenant?.name || 'dev'}"

      // If you are using TypeScript, you can do "new MultiTenant<PrismaClient>()" for autocompletion
      const multiTenant = new MultiTenant()
      
      async function main() {
        // Prisma-multi-tenant will connect to the correct tenant
        const prisma = await multiTenant.get(name)
      
        // You keep the same interface as before
        const ${modelNamePlural} = await prisma.${modelNameSingular}.findMany()
      
        console.log(${modelNamePlural})
      }

      main()
        .catch(e => console.error(e))
        .finally(async () => {
          await multiTenant.disconnect()
        })
    `
      .split('\n')
      .map((x) => x.substr(6))
      .join('\n')
      .substr(1)

    await fs.promises.writeFile(process.cwd() + '/multi-tenancy-example.js', script)
  }
}

export default new Init()
