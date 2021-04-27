import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import {
  Datasource,
  Management,
  runShell,
  readEnvFile,
  writeEnvFile,
  requireDistant,
  readSchemaFile,
  writeSchemaFile,
  isPrismaCliLocallyInstalled,
  translateDatasourceUrl,
  getSchemaPath,
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
    {
      name: 'schema',
      description: 'Specify path of schema',
    },
    {
      name: 'no-example',
      description: 'Disable creation of example file',
      boolean: true,
    },
  ]
  description = 'Init multi-tenancy for your application'

  async execute(args: CommandArguments, management: Management) {
    // 1. Install prisma-multi-tenant to the application
    await this.installPMT()

    // 2. Prompt management url
    const managementUrl = await this.getManagementDatasource(args)

    // 3. Update .env file
    const firstTenant = await this.updateEnvAndSchemaFiles(managementUrl, args.options.schema)

    // 4. Generate clients
    await this.generateClients(args.options.schema)

    // 5. Set up management
    await this.setUpManagement()

    // 6. Create first tenant from initial env
    if (firstTenant) {
      await this.createFirstTenant(firstTenant, management)
    }

    // 7. Create multi-tenancy-example.js
    if (!args.options['no-example']) {
      await this.createExample(firstTenant)
    }

    console.log(chalk`\n✅  {green Your app is now ready for multi-tenancy!}\n`)
    console.log(chalk`  {bold Next step:} Create a new tenant with \`prisma-multi-tenant new\`\n`)
  }

  async installPMT() {
    console.log('\n  Installing `@prisma-multi-tenant/client` as a dependency in your app...')

    const isUsingYarn = await useYarn()
    const command = isUsingYarn ? 'yarn add --ignore-workspace-root-check' : 'npm install'
    const devOption = isUsingYarn ? '--dev' : '-D'

    await runShell(`${command} @prisma-multi-tenant/client@${packageJson.version}`)

    if (!(await isPrismaCliLocallyInstalled())) {
      console.log('\n  Also installing `prisma` as a dev dependency in your app...')

      await runShell(`${command} ${devOption} prisma`)
    }
  }

  async getManagementDatasource(args: CommandArguments) {
    console.log(chalk`\n  {yellow We will now configure the management database:}\n`)

    let { url: managementUrl } = await prompt.managementConf(args)

    const schemaPath = args.options.schema || (await getSchemaPath())

    managementUrl = translateDatasourceUrl(managementUrl, path.dirname(schemaPath))

    process.env.MANAGEMENT_URL = managementUrl

    return managementUrl
  }

  async updateEnvAndSchemaFiles(
    managementUrl: string,
    schemaPath?: string
  ): Promise<Datasource | null> {
    console.log('\n  Updating .env and schema.prisma files...')
    let firstTenantUrl
    let mustAddDatabaseUrlEnv = false

    // Read/write schema file and try to get first tenant's url
    try {
      let schemaFile = await readSchemaFile(schemaPath)

      const datasourceConfig = schemaFile.match(/datasource\s*\w*\s*\{\s([^}]*)\}/)?.[1]
      if (!datasourceConfig) {
        throw new Error('No config found in schema.prisma')
      }

      const datasourceConfigUrl = datasourceConfig
        .split('\n')
        .map((l) =>
          l
            .trim()
            .split('=')
            .map((l) => l.trim())
        )
        .find(([key]) => key === 'url')?.[1]
      if (!datasourceConfigUrl) {
        throw new Error('No url found in datasource')
      }

      if (datasourceConfigUrl.startsWith('env("') && datasourceConfigUrl.endsWith('")')) {
        // If using an env var
        const envName = datasourceConfigUrl.slice(5, -2)
        firstTenantUrl = process.env[envName] || undefined

        if (envName !== 'DATABASE_URL') {
          // If using an env var but not "DATABASE_URL"
          mustAddDatabaseUrlEnv = true
        }
      } else if (datasourceConfigUrl.startsWith('"') && datasourceConfigUrl.endsWith('"')) {
        // If using a static value
        firstTenantUrl = datasourceConfigUrl.slice(1, -1)
        mustAddDatabaseUrlEnv = true
      } else {
        throw new Error(`Unknown format for url: "${datasourceConfigUrl}"`)
      }

      if (mustAddDatabaseUrlEnv) {
        schemaFile = schemaFile.replace(datasourceConfigUrl, 'env("DATABASE_URL")')
        await writeSchemaFile(schemaFile, schemaPath)
      }
    } catch {}

    // Write env file
    let envFile = ''

    try {
      envFile = await readEnvFile(schemaPath)
    } catch {}

    if (mustAddDatabaseUrlEnv) {
      envFile += `\nDATABASE_URL=${firstTenantUrl || ''}`
      process.env.DATABASE_URL = firstTenantUrl || ''
    }

    envFile += `

      # The following env variable is used by prisma-multi-tenant
      
      MANAGEMENT_URL=${managementUrl}
    `
      .split('\n')
      .map((x) => x.substr(6))
      .join('\n')

    await writeEnvFile(envFile, schemaPath)

    if (!firstTenantUrl) {
      console.error(chalk`\n  {red Couldn't find initial datasource url}`)
      return null
    }

    return {
      name: 'dev',
      url: firstTenantUrl,
    }
  }

  async generateClients(schemaPath?: string) {
    console.log('\n  Generating prisma clients for both management and tenants...')

    await generate.generateTenants(schemaPath)
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

    const firstModelMapping = dmmf.mappings.modelOperations[0]

    const modelNamePlural = firstModelMapping.plural
    const modelNameSingular = firstModelMapping.model.toLowerCase()

    const script = `
      const { PrismaClient } = require('@prisma/client') 
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
