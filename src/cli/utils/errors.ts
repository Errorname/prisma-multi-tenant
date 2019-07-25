import chalk from 'chalk'
import { Command } from '../types'

const messageHelp = 'Run `prisma-multi-tenant --help` to learn how to use this tool'
const messageHelpCommand = (name: string) =>
  `Run \`prisma-multi-tenant ${name} --help\` to learn how to use this command`
const messageDatasourceDoc =
  'Read the documentation to learn how to configure the datasources: [insert link here]'
const messageList = 'Run `prisma-multi-tenant list` to list all existing tenants'

const missingCommandOrOption = () => {
  console.log(chalk`
  {red Missing <command|option> argument}

  ${messageHelp}
  `)
  process.exit(1)
}

const unrecognizedCommandOrOption = (args: string[]) => {
  console.log(chalk`
  {red Unrecognized <command|option>: "${args.join(' ')}"}

  ${messageHelp}
  `)
  process.exit(1)
}

const missingArgs = (command: Command) => {
  console.log(chalk`
  {red Missing argument${command.args.length > 1 ? 's' : ''} for {bold ${command.name}}}
  
  {bold Usage: prisma-multi-tenant ${command.name} {green ${command.args
    .map(arg => `<${arg}>`)
    .join(' ')}}}
  `)
}

const misconfiguredDatasources = () => {
  // TODO: Insert link to documentation
  console.log(chalk`
  {red The datasources of your schema file are not properly configured for prisma-multi-tenant}

  ${messageDatasourceDoc}
  `)
  process.exit(1)
}

const tenantDoesNotExists = (name: string) => {
  console.log(chalk`
  {red No tenants exists with the name "${name}"}

  ${messageList}
  `)
  process.exit(1)
}

const tenantAlreadyExists = (name: string) => {
  console.log(chalk`
  {red A tenant with the name "${name}" already exists}

  ${messageList}
  `)
  process.exit(1)
}

const wrongLiftAction = (action: string) => {
  console.log(chalk`
  {red You are not allowed to use the action "${action}" for lifting}

  ${messageHelpCommand('lift')}
  `)
  process.exit(1)
}

const missingTenantOptions = () => {
  console.log(chalk`
  {red You must either use all options (name, provider and url) for the non-interactive mode or none for the interactive mode}

  ${messageHelpCommand('new')}
  `)
  process.exit(1)
}

const missingManagementOptions = () => {
  console.log(chalk`
  {red You must either use all options (provider and url) for the non-interactive mode or none for the interactive mode}

  ${messageHelpCommand('init')}
  `)
  process.exit(1)
}

export default {
  missingCommandOrOption,
  unrecognizedCommandOrOption,
  missingArgs,
  misconfiguredDatasources,
  tenantDoesNotExists,
  tenantAlreadyExists,
  wrongLiftAction,
  missingTenantOptions,
  missingManagementOptions
}
