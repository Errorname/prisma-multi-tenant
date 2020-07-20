import chalk from 'chalk'

import { CliArguments, Command } from '../types'
import { clientManagementPath, PmtError } from '@prisma-multi-tenant/shared'

export const printError = (error: PmtError, args: CliArguments): void => {
  if (error.message.match(`Cannot find module '${clientManagementPath}'`)) {
    error.type = 'missing-client-management'
  }

  if (!error.type) {
    console.log(chalk.red('Unknown Error!'))
    console.error(error)
    return
  }

  switch (error.type) {
    case 'unrecognized-command':
      if (!error.data[0]) {
        return missingCommandOrOption()
      }
      return unrecognizedCommandOrOption(args.primaryArgs)
    case 'missing-args':
      return missingArgs(error.data[0])
    case 'missing-client-management':
      return missingClientManagement()
    case 'tenant-does-not-exist':
      return tenantDoesNotExists(error.data[0])
    case 'tenant-already-exists':
      return tenantAlreadyExists(error.data[0])
    case 'unrecognized-migrate-action':
      return unrecognizedMigrateAction(error.data[0].args.join(' '))
    case 'reserved-tenant-name':
      return reservedTenantName(error.data[0])
    case 'missing-env':
      return missingEnv(error.data[0].name)
    case 'cannot-migrate-save-management':
      return cannotMigrateSaveManagement()
    default:
      console.error(error)
      return
  }
}

const messageHelp = 'Run `prisma-multi-tenant --help` to learn how to use this tool'
const messageHelpCommand = (name: string): string =>
  `Run \`prisma-multi-tenant ${name} --help\` to learn how to use this command`
const messageList = 'Run `prisma-multi-tenant list` to list all existing tenants'

const missingCommandOrOption = (): void => {
  console.log(chalk`
  {red Missing <command|option> argument}

  ${messageHelp}
  `)
}

const unrecognizedCommandOrOption = (args: string[]): void => {
  console.log(chalk`
  {red Unrecognized <command|option>: "${args.join(' ')}"}

  ${messageHelp}
  `)
}

const missingArgs = (command: Command): void => {
  console.log(chalk`
  {red Missing one or more arguments for {bold ${command.name}}}

  ${messageHelpCommand(command.name)}
  `)
}

const missingClientManagement = () => {
  console.log(chalk`
  {red No management Client found}

  Run \`prisma-multi-tenant generate\` to fix this error
  `)
}

const tenantDoesNotExists = (name: string): void => {
  console.log(chalk`
  {red No tenants exists with the name "${name}"}

  ${messageList}
  `)
}

const tenantAlreadyExists = (name: string): void => {
  console.log(chalk`
  {red A tenant with the name "${name}" already exists}

  ${messageList}
  `)
}

const unrecognizedMigrateAction = (args: string): void => {
  console.log(chalk`
  {red Unrecognized migrate action "${args}"}

  ${messageHelpCommand('migrate')}
  `)
}

const reservedTenantName = (name: string): void => {
  console.log(chalk`
  {red You cannot use "${name}" for the name of a tenant}
  `)
}

const missingEnv = (name: string): void => {
  console.log(chalk`
  {red The env variable "${name}" is required but missing}
  `)
}

const cannotMigrateSaveManagement = (): void => {
  console.log(chalk`
  {red You cannot \`migrate save\` on the management datasource}
  `)
}
