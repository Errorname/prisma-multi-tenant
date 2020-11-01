// @ts-ignore
const { MultiTenant } = require('@prisma-multi-tenant/client')
// @ts-ignore
const { fileExists } = require('../../../cli/helpers/shell')

describe('create', () => {
  test('create', async () => {
    const multiTenant = new MultiTenant()

    const tenant = await multiTenant.createTenant({
      name: 'test-create-1',
      url: 'file:test-create-1.db',
    })

    expect(tenant).toBeDefined()
    expect(tenant._meta).toStrictEqual({ name: 'test-create-1' })
    expect(tenant).toBeInstanceOf(multiTenant.ClientTenant)
    expect(multiTenant.tenants['test-create-1']).toBe(tenant)
    await expect(fileExists('test-client/prisma/test-create-1.db'))
      .resolves.toBe(true)
      .then(() => multiTenant.disconnect())
  })

  test('useManagement:false', async () => {
    const multiTenant = new MultiTenant({ useManagement: false })

    await expect(
      multiTenant.createTenant({
        name: 'test-create-2',
        url: 'file:test-create-2.db',
      })
    )
      .rejects.toThrow()
      .then(() => multiTenant.disconnect())
  })

  test('tenant already exists', async () => {
    const multiTenant = new MultiTenant()

    await expect(
      multiTenant.createTenant({
        name: 'test1',
        url: 'file:dev1-bis.db',
      })
    )
      .rejects.toThrow()
      .then(() => multiTenant.disconnect())
  })

  test('reserved name', async () => {
    const multiTenant = new MultiTenant()

    await expect(
      multiTenant.createTenant({
        name: 'management',
        url: 'file:test-create-4.db',
      })
    )
      .rejects.toThrow()
      .then(() => multiTenant.disconnect())
  })
})
