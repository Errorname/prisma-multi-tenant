import { datasourceProviders } from '../shared/constants'
import { runDistant, requireDistant } from '../shared/shell'
import Management from '../shared/management'
import { Tenant } from '../shared/types'

interface MultiTenantOptions {
  useManagement?: boolean
  PrismaClient?: any
  PrismaClientManagement?: any
}

interface WithMeta {
  _meta: {
    name: string
  }
}

const defaultMultiTenantOptions = {
  useManagement: true
}

class MultiTenant<PrismaClient extends { disconnect: () => Promise<void> }> {
  ClientTenant: any

  management?: Management
  tenants: { [name: string]: PrismaClient & WithMeta }

  options: MultiTenantOptions

  constructor(options?: MultiTenantOptions) {
    this.options = { ...defaultMultiTenantOptions, ...options }

    this.ClientTenant = this.requireTenant()

    if (this.options.useManagement) {
      this.management = new Management({ PrismaClient: this.options.PrismaClientManagement })
    }

    this.tenants = {}
  }

  private requireTenant(): any {
    if (this.options.PrismaClient) {
      return this.options.PrismaClient
    }
    return requireDistant(`@prisma/client`).PrismaClient
  }

  async get(name: string, options?: any): Promise<PrismaClient & WithMeta> {
    if (this.tenants[name]) return this.tenants[name]

    if (!this.management) {
      throw new Error('Cannot use .get(name) on an unknown tenant with `useManagement: false`')
    }

    const tenant = await this.management.read(name)

    if (!tenant) {
      throw new Error(`The tenant with the name "${name}" does not exist`)
    }

    return this.directGet(tenant, options)
  }

  async directGet(
    tenant: { name: string; url: string },
    options?: any
  ): Promise<PrismaClient & WithMeta> {
    process.env.DATABASE_URL = tenant.url
    const client = new this.ClientTenant(options)

    client._meta = {
      name: tenant.name
    }

    this.tenants[tenant.name] = client

    return client as PrismaClient & WithMeta
  }

  async createTenant(
    tenant: { name: string; provider: string; url: string },
    options?: any
  ): Promise<PrismaClient & WithMeta> {
    if (!this.management) {
      throw new Error('Cannot use .createTenant(tenant, options) with `useManagement: false`')
    }

    if (!datasourceProviders.includes(tenant.provider)) {
      throw new Error(
        `Unrecognized "${tenant.provider}" provider. Known providers: ${datasourceProviders.join(
          ', '
        )}`
      )
    }

    await this.management.create(tenant)

    await runDistant('prisma2 migrate up --create-db --experimental', tenant)

    return this.directGet(tenant, options)
  }

  async deleteTenant(name: string): Promise<Tenant> {
    if (!this.management) {
      throw new Error('Cannot use .deleteTenant(name) with `useManagement: false`')
    }

    if (this.tenants[name]) {
      delete this.tenants[name]
    }

    const tenant = await this.management.delete(name)

    await runDistant('prisma2 migrate down --experimental', tenant)

    return tenant
  }

  async existsTenant(name: string): Promise<Boolean> {
    if (!this.management) {
      throw new Error('Cannot use .existsTenant(name) with `useManagement: false`')
    }

    if (this.tenants[name]) return true

    return this.management.exists(name)
  }

  disconnect(): Promise<void[]> {
    return Promise.all([
      ...(this.management ? [this.management.disconnect()] : []),
      ...Object.values(this.tenants).map(t => t.disconnect())
    ])
  }
}

export { MultiTenant }
