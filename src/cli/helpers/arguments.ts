import arg from 'arg'

import { CliArguments, Command } from '../../shared/types'
import { CliError } from '../../shared/errors'

export const parseArgs = (): CliArguments => {
  const argv = process.argv.slice(2)

  const [primaryArgs = [], secondaryArgs = []] = argv
    .join(' ')
    .split(/\s?--\s/g)
    .map(x => x.trim().split(' '))

  const parsedPrimaryArgs = arg(
    {
      // Types
      '--help': Boolean,
      '--version': Boolean,
      '--verbose': Boolean, // Counts the number of times --verbose is passed

      // Aliases
      '-h': '--help',
      '-v': '--version'
    },
    { permissive: true, argv: primaryArgs }
  )

  const commandName = primaryArgs.filter(a => !a.startsWith('-'))[0]

  return {
    argv,
    primaryArgs,
    secondaryArgs,
    parsedPrimaryArgs,
    commandName
  }
}

export const convertToCommandArgs = (
  command: Command,
  { primaryArgs, parsedPrimaryArgs: { _ }, secondaryArgs }: CliArguments
) => {
  const options = (command.options || []).reduce((acc: { [name: string]: string }, { name }) => {
    let arg = _.find(arg => arg.startsWith('--' + name))

    if (arg) {
      acc[name] = arg.split('=')[1] || 'true'
    }

    return acc
  }, {})

  const args = primaryArgs.filter(a => !a.startsWith('-')).slice(1)

  if (command.args.filter(a => !a.optional).length > args.length) {
    throw new CliError('missing-args', command)
  }

  return {
    args,
    options,
    secondary: secondaryArgs.join(' ')
  }
}

export const shouldPrintHelp = ({ commandName, parsedPrimaryArgs }: CliArguments) => {
  if (commandName == 'help') return true

  if (parsedPrimaryArgs['--help'] && parsedPrimaryArgs._.length == 0) return true

  return false
}

export const shouldPrintVersion = ({ parsedPrimaryArgs }: CliArguments) => {
  return parsedPrimaryArgs['--version'] || false
}

export const shouldSetVerbose = ({ parsedPrimaryArgs }: CliArguments) => {
  return parsedPrimaryArgs['--verbose'] || false
}
