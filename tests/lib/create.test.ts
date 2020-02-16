// @ts-ignore
const { MultiTenant } = require('prisma-multi-tenant')
// @ts-ignore
const { fileExists } = require('../../../cli/helpers/shell')

describe('create', () => {
  test('create', async () => {
    const multiTenant = new MultiTenant()

    const tenant = await multiTenant.createTenant({
      name: 'test-create-1',
      provider: 'sqlite',
      url: 'file:test-create-1.db'
    })

    expect(tenant).toBeDefined()
    expect(tenant._meta).toStrictEqual({ name: 'test-create-1' })
    expect(tenant).toBeInstanceOf(multiTenant.ClientTenant)
    expect(multiTenant.tenants['test-create-1']).toBe(tenant)
    expect(fileExists('test-lib/prisma/test-create-1.db'))
      .resolves.toBe(true)
      .then(() => multiTenant.disconnect())
  })

  test('useManagement:false', async () => {
    const multiTenant = new MultiTenant({ useManagement: false })

    expect(
      multiTenant.createTenant({
        name: 'test-create-2',
        provider: 'sqlite',
        url: 'file:test-create-2.db'
      })
    )
      .rejects.toThrow()
      .then(() => multiTenant.disconnect())
  })

  test('tenant already exists', async () => {
    const multiTenant = new MultiTenant()

    expect(
      multiTenant.createTenant({
        name: 'test1',
        provider: 'sqlite',
        url: 'file:dev1-bis.db'
      })
    )
      .rejects.toThrow()
      .then(() => multiTenant.disconnect())
  })

  test('unrecognized provider', async () => {
    const multiTenant = new MultiTenant()

    expect(
      multiTenant.createTenant({
        name: 'test-create-3',
        provider: 'not-a-real-provider',
        url: 'file:test-create-3.db'
      })
    )
      .rejects.toThrow()
      .then(() => multiTenant.disconnect())
  })

  test('different provider', async () => {
    const multiTenant = new MultiTenant()

    expect(
      multiTenant.createTenant({
        name: 'test-create-4',
        provider: 'postgresql',
        url: 'file:test-create-4.db'
      })
    )
      .rejects.toThrow()
      .then(() => multiTenant.disconnect())
  })
})
