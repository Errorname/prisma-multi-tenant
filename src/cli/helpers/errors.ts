import chalk from 'chalk'

import { CliArguments, Command } from '../../shared/types'
import { photonManagementPath } from '../../shared/constants'
import { PmtError } from '../../shared/errors'

export const printError = (error: PmtError, args: CliArguments) => {
  if (error.message.match(`Cannot find module '${photonManagementPath}'`)) {
    error.type = 'missing-photon-management'
  }

  if (!error.type) {
    console.log(chalk.red('Unknown Error!'))
    console.error(error)
    return
  }

  ;(() => {
    switch (error.type) {
      case 'unrecognized-command':
        if (!error.data[0]) {
          return missingCommandOrOption()
        }
        return unrecognizedCommandOrOption(args.primaryArgs)
      case 'missing-args':
        return missingArgs(error.data[0])
      case 'no-existing-datasource':
        return noExistingDatasource()
      case 'no-schema-found':
        return noSchemaFound()
      case 'no-management-datasource':
        return noManagementDatasource()
      case 'missing-photon-management':
        return missingPhotonManagement()
      case 'tenant-does-not-exist':
        return tenantDoesNotExists(error.data[0])
      case 'tenant-already-exists':
        return tenantAlreadyExists(error.data[0])
      case 'unrecognized-lift-action':
        return unrecognizedLiftAction(error.data[0].args.join(' '))
      case 'reserved-tenant-name':
        return reservedTenantName(error.data[0])
      default:
        console.error(error)
    }
  })()

  process.exit(1)
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

const noExistingDatasource = () => {
  console.log(chalk`
  {red No existing datasource found in your schema.prisma file}
  `)
}

const noSchemaFound = () => {
  console.log(chalk`
  {red No schema.prisma file found in your project}
  `)
}

const noManagementDatasource = () => {
  console.log(chalk`
  {red No management datasource present in your schema.prisma file}
  `)
}

const missingPhotonManagement = () => {
  console.log(chalk`
  {red No management Photon found}

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

const unrecognizedLiftAction = (args: string): void => {
  console.log(chalk`
  {red Unrecognized lift action "${args}"}

  ${messageHelpCommand('lift')}
  `)
}

const reservedTenantName = (name: string): void => {
  console.log(chalk`
  {red You cannot use "${name}" for the name of a tenant}
  `)
}
