import arg from 'arg'

import { CliArguments, Command } from '../../shared/types'
import { PmtError } from '../../shared/errors'

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
  const spec = (command.options || []).reduce((acc: any, option) => {
    acc['--' + option.name] = option.boolean ? Boolean : String
    return acc
  }, {})

  const parsed = arg(spec, { permissive: true, argv: _ })

  const options = (command.options || []).reduce((acc: { [name: string]: string }, { name }) => {
    if (parsed['--' + name]) {
      acc[name] = parsed['--' + name]
    }

    return acc
  }, {})

  const args = primaryArgs.filter(a => !a.startsWith('-')).slice(1)

  if (command.args.filter(a => !a.optional).length > args.length) {
    throw new PmtError('missing-args', command)
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
