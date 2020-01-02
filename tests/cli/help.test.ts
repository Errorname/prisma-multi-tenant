import * as allCommands from '../../src/cli/commands'
import { Command } from '../../src/shared/types'
import { runShell } from './helpers/shell'

const packageJson = require('../../package.json')

const commands = Object.values(allCommands) as Command[]

describe('help', () => {
  // Test "help" command
  test('command "help"', async () => {
    const ret = await runShell('prisma-multi-tenant help')

    expect(ret).toEqual(expect.stringContaining(`prisma-multi-tenant`))
    expect(ret).toEqual(expect.stringContaining(`v${packageJson.version}`))

    // Test that it contains the name & description of all commands
    for (let command of commands) {
      expect(ret).toEqual(expect.stringContaining(command.name))
      expect(ret).toEqual(expect.stringContaining(command.description))
    }
  })

  // Test help option on all commands
  for (let command of commands) {
    if (command.name != 'help') {
      test(`command "${command.name}"`, async () => {
        const ret = await runShell(`prisma-multi-tenant ${command.name} --help`)

        expect(ret).toEqual(expect.stringContaining(command.name))
        expect(ret).toEqual(expect.stringContaining(command.description))

        // Test that it shows all args
        for (let argument of command.args || []) {
          expect(ret).toEqual(expect.stringContaining(argument.name))
          expect(ret).toEqual(expect.stringContaining(argument.description))
        }

        // Test that it shows all options
        for (let option of command.options || []) {
          expect(ret).toEqual(expect.stringContaining(option.name))
          expect(ret).toEqual(expect.stringContaining(option.description))
        }
      })
    }
  }
})
