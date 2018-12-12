import MultiTenant from './MultiTenant'
import defaultOptions from './defaultOptions'
import { MultiTenantOptions, PrismaInstance } from './types'

describe('MultiTenant', () => {
  it('should have default options', () => {
    const multiTenant = new MultiTenant()

    expect(multiTenant.options).toEqual(defaultOptions)
  })

  it('should override default options', () => {
    const options: MultiTenantOptions = {
      instanciate: () => ({ test: true }),
      nameStageFromReq: () => ['default', 'prod']
    }

    const multiTenant = new MultiTenant(options)

    expect(multiTenant.options).toEqual(options)
  })

  it('should instanciate', () => {
    const multiTenant = new MultiTenant()

    const instance = multiTenant.instanciate('default', 'default')

    expect(instance).not.toBeNull()
  })

  it('should retrieve an instanciated Prisma', () => {
    const multiTenant = new MultiTenant()

    const instance = multiTenant.instanciate('default', 'default')

    const retrieved = multiTenant.getInstance('default', 'default')

    expect(retrieved).toBe(instance)
  })

  it("shouldn't retrieve an non-instanciated Prisma", () => {
    const multiTenant = new MultiTenant()

    const instance = multiTenant.getInstance('default', 'default')

    expect(instance).toBeNull()
  })

  it('should return the current instance based on the request', () => {
    const req = { headers: { 'prisma-service': 'default/default' } }

    const multiTenant = new MultiTenant()

    const instance = multiTenant.instanciate('default', 'default')
    const current = multiTenant.current(req)

    expect(current).toBe(instance)
  })

  it('should instanciate the current instance based on the request', () => {
    const req = { headers: { 'prisma-service': 'default/default' } }

    const multiTenant = new MultiTenant()

    const current = multiTenant.current(req)

    expect(current).not.toBeNull()
    expect(current._meta).toEqual({ service: { name: 'default', stage: 'default' } })
  })
})
