import path from 'path'

// @ts-ignore
const { MultiTenant } = require('prisma-multi-tenant')

require('dotenv').config({
  path: path.resolve(process.cwd(), 'prisma/.env')
})

describe('exists', () => {
  test('tenant exists', async () => {
    const multiTenant = new MultiTenant()

    await multiTenant.createTenant({
      name: 'test-exists-1',
      provider: 'sqlite',
      url: 'file:test-exists-1.db'
    })

    await expect(multiTenant.existsTenant('test-exists-1'))
      .resolves.toBe(true)
      .then(() => multiTenant.disconnect())
  })

  test("tenant doesn't exist", async () => {
    const multiTenant = new MultiTenant()

    await expect(multiTenant.existsTenant('test-exists-2'))
      .resolves.toBe(false)
      .then(() => multiTenant.disconnect())
  })

  test('useManagement: false', async () => {
    const multiTenant = new MultiTenant({ useManagement: false })

    await expect(multiTenant.existsTenant('test-exists-3'))
      .rejects.toThrow()
      .then(() => multiTenant.disconnect())
  })
})
