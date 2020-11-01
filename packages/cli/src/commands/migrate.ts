import chalk from 'chalk'

import {
  Datasource,
  Management,
  PmtError,
  runDistantPrisma,
  runLocalPrisma,
  spawnShell,
  getSchemaPath,
} from '@prisma-multi-tenant/shared'

import { Command, CommandArguments } from '../types'

const migrateActions = ['up', 'down', 'save']

class Migrate implements Command {
  name = 'migrate'
  args = [
    {
      name: 'name',
      optional: true,
      description: 'Name of the tenant you want to migrate',
    },
    {
      name: 'action',
      optional: false,
      description: 'Migrate "up", "down" or "save" the tenant',
    },
  ]
  options = [
    {
      name: 'schema',
      description: 'Specify path of schema',
    },
  ]
  description = 'Migrate tenants (up, down, save)'

  async execute(args: CommandArguments, management: Management) {
    const { name, action, migrateArgs, prismaArgs } = this.parseArgs(args)

    if (action == 'save') {
      // A. Save on default tenant
      if (!name) {
        console.log(`\n  Saving migration with default tenant...\n`)

        await this.migrateSave(management, undefined, args.options.schema, migrateArgs, prismaArgs)

        console.log(chalk`\n✅  {green Successfuly saved the migration}\n`)
        return
      }

      // B. Save on management
      if (name == 'management') {
        throw new PmtError('cannot-migrate-save-management')
      }

      // C. Save on specific tenant
      console.log(`\n  Saving migration with tenant "${name}"...\n`)

      await this.migrateSave(management, name, args.options.schema, migrateArgs, prismaArgs)

      console.log(chalk`\n✅  {green Successfuly saved the migration}\n`)
      return
    } else {
      // D. Migrate up or down on all tenants
      if (!name) {
        console.log(`\n  Migrating ${action} all tenants...\n`)

        await this.migrateAllTenants(
          management,
          action,
          args.options.schema,
          migrateArgs,
          prismaArgs
        )

        console.log(chalk`\n✅  {green Successfuly migrated ${action} all tenants}\n`)
        return
      }

      // E. Migrate up or down management
      if (name == 'management') {
        console.log(`\n  Migrating management ${action}...`)

        await this.migrateManagement(action, migrateArgs, prismaArgs)

        console.log(chalk`\n✅  {green Successfuly migrated ${action} management}\n`)
        return
      }

      // F. Migrate up or down a specific tenant
      console.log(`\n  Migrating "${name}" ${action}...`)

      await this.migrateOneTenant(
        management,
        action,
        name,
        args.options.schema,
        migrateArgs,
        prismaArgs
      )

      console.log(chalk`\n✅  {green Successfuly migrated ${action} "${name}"}\n`)
    }
  }

  parseArgs(args: CommandArguments) {
    const [arg1, arg2, ...restArgs] = args.args

    let name
    let action
    let migrateArgs

    if (migrateActions.includes(arg2)) {
      name = arg1
      action = arg2
      migrateArgs = restArgs.join(' ')
    } else if (migrateActions.includes(arg1)) {
      action = arg1
      migrateArgs = [arg2, ...restArgs].join(' ')
    } else {
      throw new PmtError('unrecognized-migrate-action', args)
    }

    return { name, action, migrateArgs, prismaArgs: args.secondary }
  }

  async migrateOneTenant(
    management: Management,
    action: string,
    name: string,
    schemaPath?: string,
    migrateArgs = '',
    prismaArgs = ''
  ) {
    const tenant = await management.read(name)

    return this.migrateTenant(action, tenant, schemaPath, migrateArgs, prismaArgs)
  }

  async migrateAllTenants(
    management: Management,
    action: string,
    schemaPath?: string,
    migrateArgs = '',
    prismaArgs = ''
  ) {
    const tenants = await management.list()

    for (const tenant of tenants) {
      console.log(`    > Migrating "${tenant.name}" ${action}`)
      await this.migrateTenant(action, tenant, schemaPath, migrateArgs, prismaArgs)
    }
  }

  async migrateTenant(
    action: string,
    tenant?: Datasource,
    schemaPath?: string,
    migrateArgs = '',
    prismaArgs = ''
  ) {
    schemaPath = schemaPath || (await getSchemaPath())
    return runDistantPrisma(
      `migrate ${action} ${migrateArgs} --schema ${schemaPath} ${prismaArgs} --experimental`,
      tenant
    )
  }

  migrateManagement(action: string, migrateArgs = '', prismaArgs = '') {
    return runLocalPrisma(`migrate ${action} ${migrateArgs} ${prismaArgs} --experimental`)
  }

  async migrateSave(
    management: Management,
    name?: string,
    schemaPath?: string,
    migrateArgs = '',
    prismaArgs = ''
  ) {
    if (name) {
      const tenant = await management.read(name)
      process.env.DATABASE_URL = tenant.url
    }

    schemaPath = schemaPath || (await getSchemaPath())

    const retCode = await spawnShell(
      `npx @prisma/cli migrate save ${migrateArgs} --schema ${schemaPath} ${prismaArgs} --experimental`
    )

    if (retCode === 1) {
      if (process.env.VERBOSE === 'true') {
        // Bug with npm@7 and npx
        console.log('This is probably a bug with npm. Retrying...')
      }
      return spawnShell(
        `prisma migrate save ${migrateArgs} --schema ${schemaPath} ${prismaArgs} --experimental`
      )
    }

    return retCode
  }
}

export default new Migrate()
