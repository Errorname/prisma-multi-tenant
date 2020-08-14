import path from 'path'

// @ts-ignore
const { MultiTenant } = require('@prisma-multi-tenant/client')

describe('get', () => {
  test('get existing tenant', async () => {
    const multiTenant = new MultiTenant()

    const tenant = await multiTenant.get('test1')

    expect(tenant).toBeDefined()
    expect(tenant._meta).toStrictEqual({ name: 'test1' })
    expect(tenant).toBeInstanceOf(multiTenant.ClientTenant)
    expect(multiTenant.tenants['test1']).toBe(tenant)

    await multiTenant.$disconnect()
  })

  test('get non-existing tenant', async () => {
    const multiTenant = new MultiTenant()

    await expect(multiTenant.get('unknown-tenant'))
      .rejects.toThrow()
      .then(() => multiTenant.$disconnect())
  })

  test('get with useManagement: false', async () => {
    const multiTenant = new MultiTenant({
      useManagement: false,
    })

    await expect(multiTenant.get('test1'))
      .rejects.toThrow()
      .then(() => multiTenant.$disconnect())
  })

  test('directGet', async () => {
    const multiTenant = new MultiTenant()

    const tenant = await multiTenant.directGet({
      name: 'test1',
      url: 'file:dev1.db',
    })

    expect(tenant).toBeDefined()
    expect(tenant._meta).toStrictEqual({ name: 'test1' })
    expect(tenant).toBeInstanceOf(multiTenant.ClientTenant)
    expect(multiTenant.tenants['test1']).toBe(tenant)

    await multiTenant.$disconnect()
  })
})
