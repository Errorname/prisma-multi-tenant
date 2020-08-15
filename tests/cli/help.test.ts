import { runShell } from './helpers/shell'

const packageJson = require('../../package.json')

const commands = {
  init: 'Init multi-tenancy for your application',
  list: 'List all tenants',
  new: 'Create a new tenant or management',
  studio: 'Use Studio to access a tenant',
  migrate: 'Migrate tenants (up, down, save)',
  delete: 'Delete one tenant',
  generate: 'Generate Prisma Clients for the tenants and management',
  env: 'Set env variables for a specific tenant',
  eject: 'Eject prisma-multi-tenant from your application',
  help: 'Display this help',
}

describe('help', () => {
  // Test "help" command
  test('command "help"', async () => {
    const ret = await runShell('prisma-multi-tenant help')

    expect(ret).toEqual(expect.stringContaining(`prisma-multi-tenant`))
    expect(ret).toEqual(expect.stringContaining(`v${packageJson.version}`))

    // Test that it contains the name & description of all commands
    for (let [name, description] of Object.entries(commands)) {
      expect(ret).toEqual(expect.stringContaining(name))
      expect(ret).toEqual(expect.stringContaining(description))
    }
  })

  // Test help option on all commands
  for (let [name, description] of Object.entries(commands)) {
    if (name != 'help') {
      test(`command "${name}"`, async () => {
        const ret = await runShell(`prisma-multi-tenant ${name} --help`)

        expect(ret).toEqual(expect.stringContaining(name))
        expect(ret).toEqual(expect.stringContaining(description))
      })
    }
  }
})
