import chalk from 'chalk'

import { Command } from '../../shared/types'

import * as commands from '../commands'

const packageJson = require('../../../package.json')

const printGlobalHelp = (): void => {
  console.log(chalk`
  {bold.cyan 🧭  prisma-multi-tenant} {grey v${packageJson.version}}
  
  {bold USAGE}

    {bold.italic prisma-multi-tenant} [command] [args]
    
    {grey Examples:}
        {grey prisma-multi-tenant new}
        {grey prisma-multi-tenant migrate my_tenant up}
        {grey prisma-multi-tenant env my_tenant -- npx @prisma/cli introspect}
        {grey ...}

  {bold COMMANDS}
    
${Object.values(commands)
  .map((command: Command): string => {
    const args = command.args
      .filter((arg): boolean => !arg.secondary)
      .map((arg): string => `<${arg.name + (arg.optional ? '?' : '')}>`)
      .join(' ')
    const strLength = command.name.length + args.length
    const spaceBetween = ''.padStart(24 - strLength)

    return chalk`    {bold ${command.name}} ${args} ${spaceBetween} ${command.description}`
  })
  .join('\n')}

  {bold OPTIONS}

    {bold -h, --help}                 Output usage information for a command
    {bold -v, --version}              Output the version number
    {bold -e, --env}                  Load env file given as parameter
    {bold --verbose}                  Print additional logs
  `)
  process.exit(0)
}

const printCommandHelp = (command: Command): void => {
  console.log(chalk`
  {bold.cyan 🧭  prisma-multi-tenant} {bold.yellow ${command.name}}

    ${command.description}

  {bold USAGE}

    {bold.italic prisma-multi-tenant} ${command.name}${
    command.args.length > 0 ? ' ' : ''
  }${command.args
    .map(
      (arg): string =>
        `${arg.secondary ? '<' : '['}${arg.name + (arg.optional ? '?' : '')}${
          arg.secondary ? '>' : ']'
        }`
    )
    .join(' ')}${
    command.options
      ? ' (' +
        command.options
          .map((option): string => `--${option.name}` + (option.boolean ? '' : `=[${option.name}]`))
          .join(' ') +
        ')'
      : ''
  }
  `)

  if (command.args.length > 0) {
    console.log(chalk`
  {bold ARGS}

${command.args
  .map((arg): string => {
    const argStr = arg.name.replace(/\|/g, ', ')
    const strLength = argStr.length
    const spaceBetween = ''.padStart(15 - strLength)

    return chalk`    {bold ${argStr}} ${spaceBetween} ${arg.description} ${
      arg.optional ? chalk`{italic.grey (optional)}` : ''
    }`
  })
  .join('\n')}
    `)
  }

  console.log(chalk`\n  {bold OPTIONS}`)

  if (command.options && command.options.length > 0) {
    console.log(
      '\n' +
        command.options
          .map((option): string => {
            const strLength = option.name.length
            const spaceBetween = ''.padStart(13 - strLength)

            return chalk`    {bold --${option.name}} ${spaceBetween} ${option.description}`
          })
          .join('\n')
    )
  }

  console.log(chalk`
    {bold -h, --help}       Display this help
    {bold -e, --env}        Load env file given as parameter
    {bold --verbose}        Print additional logs
  `)
}

const printGlobalVersion = (): void => {
  console.log(packageJson.version)
  process.exit(0)
}

export default {
  printGlobalHelp,
  printCommandHelp,
  printGlobalVersion
}
