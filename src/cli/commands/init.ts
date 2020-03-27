import chalk from 'chalk'

import { Command, CommandArguments, Datasource, Tenant } from '../../shared/types'
import { runShell, useYarn, requireDistant, writeFile } from '../../shared/shell'
import prompt from '../helpers/prompt'
import { readEnvFile, writeEnvFile } from '../../shared/env'
import generate from './generate'
import migrate from './migrate'
import Management from '../../shared/management'

const packageJson = require('../../../package.json')

class Init implements Command {
  name = 'init'
  args = []
  options = [
    {
      name: 'provider',
      description: 'Type of the management provider'
    },
    {
      name: 'url',
      description: 'URL of the management database'
    }
  ]
  description = 'Init multi-tenancy for your application'

  async execute(args: CommandArguments, management: Management) {
    // 1. Install prisma-multi-tenant to the application
    await this.installPMT()

    // 2. Prompt provider & url
    const managementDS = await this.getManagementDatasource(args)

    // 3. Update .env file
    const firstTenant = await this.updateEnvFile(managementDS)

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

    if (!firstTenant) {
      console.log(chalk`  {bold Next step:} Create a new tenant with \`prisma-multi-tenant new\`\n`)
    }
  }

  async installPMT() {
    console.log('\n  Installing `prisma-multi-tenant` in your app...')

    // This is used for testing purposes
    if (process.env.PMT_TEST) {
      return runShell(`npm link prisma-multi-tenant`)
    }

    const yarnOrNpm = (await useYarn()) ? 'yarn add' : 'npm install'

    return runShell(`${yarnOrNpm} prisma-multi-tenant@${packageJson.version}`)
  }

  async getManagementDatasource(args: CommandArguments) {
    console.log(chalk`\n  {yellow We will now configure the management database:}\n`)

    const managementDS = await prompt.managementConf(args)

    process.env.MANAGEMENT_URL = managementDS.url
    process.env.MANAGEMENT_PROVIDER = managementDS.provider

    return managementDS
  }

  async updateEnvFile(managementDS: Datasource): Promise<Tenant | null> {
    const envFile = await readEnvFile()

    const envs = `

      # The following env variables are used by prisma-multi-tenant
    
      MANAGEMENT_PROVIDER=${managementDS.provider}
      MANAGEMENT_URL=${managementDS.url}
    `
      .split('\n')
      .map(x => x.substr(6))
      .join('\n')

    await writeEnvFile(envFile + envs)

    const url = process.env.DATABASE_URL

    if (!url) {
      console.error(chalk`\n  {red Couldn't find DATABASE_URL env variable}`)
      return null
    }

    let provider

    if (url.startsWith('file')) {
      provider = 'sqlite'
    } else if (url.startsWith('mongo')) {
      provider = 'mongo'
    } else if (url.startsWith('postgres')) {
      provider = 'postgresql'
    } else {
      console.error(chalk`\n  {red Couldn't infer database provider from DATABASE_URL.}`)
      return null
    }

    return {
      name: 'dev',
      provider,
      url
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

  async createFirstTenant(firstTenant: Tenant, management: Management) {
    console.log('\n  Creating first tenant from your initial schema...')

    await management.create(firstTenant)
  }

  async createExample(firstTenant: Tenant | null) {
    console.log('\n  Creating example script...')

    const { PrismaClient } = requireDistant('@prisma/client')

    const tenant = new PrismaClient()

    const firstModelMapping = tenant.dmmf.mappings[0]

    // We should use singular name (See prisma/prisma-client-js#509)
    const modelNamePlural = firstModelMapping.plural
    const modelNameSingular = firstModelMapping.model.toLowerCase()

    const script = `
      // const { PrismaClient } = require('@prisma/client') // Uncomment for TypeScript support
      const { MultiTenant } = require('prisma-multi-tenant')

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
      .map(x => x.substr(6))
      .join('\n')
      .substr(1)

    await writeFile(process.cwd() + '/multi-tenancy-example.js', script)
  }
}

export default new Init()
