#!/usr/bin/env node

import * as commands from './commands'
import {
  parseArgs,
  convertToCommandArgs,
  shouldPrintHelp,
  shouldPrintVersion,
  shouldSetVerbose
} from './helpers/arguments'
import { printError } from './helpers/errors'
import help from './helpers/help'
import management from './management'

import { CliError } from '../shared/errors'

const args = parseArgs()

const run = async (): Promise<void> => {
  // Printing help
  if (shouldPrintHelp(args)) {
    return help.printGlobalHelp()
  }

  // Printing version
  if (shouldPrintVersion(args)) {
    return help.printGlobalVersion()
  }

  // Setting verbosity
  if (shouldSetVerbose(args)) {
    process.env.verbose = 'true'
  }

  const { parsedPrimaryArgs, commandName } = args

  // Finding command
  const command = Object.values(commands).find(c => c.name == commandName)

  if (!command) {
    throw new CliError('unrecognized-command', commandName)
  }

  if (parsedPrimaryArgs['--help']) {
    help.printCommandHelp(command)
    return
  }

  // Executing command
  await command.execute(convertToCommandArgs(command, args))
}

run()
  .then(async () => {
    await management.disconnect()
  })
  .catch(async err => {
    printError(err, args)
    await management.disconnect()
    process.exit(1)
  })
