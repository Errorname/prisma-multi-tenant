import chalk from 'chalk'

import { Command, CommandArguments, Datasource, Tenant } from '../../shared/types'
import { runShell, useYarn, requireDistant, writeFile } from '../../shared/shell'
import prompt from '../helpers/prompt'
import { writeSchema, readSchema, parseSchema, prismaSchemaFragment } from '../../shared/schema'
import generate from './generate'
import migrate from './migrate'
import { PmtError } from '../../shared/errors'
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

    // 3. Update schema.prisma
    const firstTenant = await this.updatePrismaSchema(managementDS)

    // 4. Generating clients
    await this.generatingClients()

    // 5. Set up management
    await this.setUpManagement()

    // 6. Create first tenant from initial schema
    await this.createFirstTenant(firstTenant, management)

    // 7. Create multi-tenancy-example.js
    await this.createExample(firstTenant)

    console.log(chalk`\n✅  {green Your app is now ready for multi-tenancy!}\n`)
  }

  async installPMT() {
    console.log('\n  Installing `prisma-multi-tenant` in your app...')

    const yarnOrNpm = (await useYarn()) ? 'yarn add' : 'npm install'

    return runShell(`${yarnOrNpm} prisma-multi-tenant@${packageJson.version}`)
  }

  getManagementDatasource(args: CommandArguments) {
    console.log(chalk`\n  {yellow We will now configure the management database:}\n`)

    return prompt.managementConf(args)
  }

  async updatePrismaSchema(managementDS: Datasource) {
    console.log('\n  Updating your schema.prisma file...')

    const schema = await readSchema()

    const previousDatasources = (await parseSchema(schema)).datasources

    if (previousDatasources.length == 0) {
      throw new PmtError('no-existing-datasource')
    }

    const previous = {
      name: previousDatasources[0].name,
      provider: previousDatasources[0].connectorType,
      url: previousDatasources[0].url.value
    }

    const strToPrepend = prismaSchemaFragment(previous, managementDS)
    const newSchema = strToPrepend + schema.replace(/datasource\s[^\{]*{[^\}]*}\n\n/g, '')

    await writeSchema(newSchema)

    return previous
  }

  async generatingClients() {
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

  async createExample(firstTenant: Tenant) {
    console.log('\n  Creating example script...')

    const { PrismaClient } = requireDistant('@prisma/client')

    const tenant = new PrismaClient()

    const firstModelMapping = tenant.dmmf.mappings[0]
    const modelName = firstModelMapping.plural

    const script = `
      // const { PrismaClient } = require('@prisma/PrismaClient') // Uncomment for TypeScript support
      const { MultiTenant } = require('prisma-multi-tenant')

      // This is the name of your first tenant, try with another one
      const name = "${firstTenant.name}"

      // If you are using TypeScript, you can do "new MultiTenant<PrismaClient>()" for autocompletion
      const multiTenant = new MultiTenant()
      
      async function main() {
        // Prisma-multi-tenant will connect to the correct tenant
        const prisma = await multiTenant.get(name)
      
        // You keep the same interface as before
        const ${modelName} = await prisma.${modelName}.findMany()
      
        console.log(${modelName})
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
