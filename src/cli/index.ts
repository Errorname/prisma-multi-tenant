#!/usr/bin/env node

import { help, errors } from './utils'
import management from './management'

import * as commands from './commands'
import { Command, Argument } from './types'

const [, , ...args] = process.argv

const run = async (): Promise<void> => {
  if (args.length == 0) {
    return errors.missingCommandOrOption()
  }

  switch (args[0]) {
    case '-h':
    case '--help':
    case 'help':
      return help.printGlobalHelp()

    case '-V':
    case '--version':
      return help.printGlobalVersion()
  }

  process.env.verbose = `${args.includes('--verbose')}`

  const command: Command | undefined = Object.values(commands).find(
    (c: Command): boolean => c.name == args[0]
  )

  if (!command) {
    return errors.unrecognizedCommandOrOption(args)
  }

  if (args.includes('-h') || args.includes('--help')) {
    return help.printCommandHelp(command)
  }

  if (command.args.filter((a: Argument): boolean => !a.optional).length > 0 && args.length == 1) {
    return errors.missingArgs(command)
  }

  if (command.useManagement) {
    await management.connect()
  }

  await command.execute(args.slice(1))

  if (command.useManagement) {
    await management.disconnect()
  }
}

run()
  .catch((e: Error): void => console.error(e))
  .finally(
    async (): Promise<void> => {
      if (management.photon) {
        await management.disconnect()
      }
    }
  )
