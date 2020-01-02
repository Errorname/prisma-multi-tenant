import { datasourceProviders } from '../shared/constants'
import { runDistant } from '../shared/shell'
import { getTenantDatasource } from '../shared/schema'
import Management from '../shared/management'

interface MultiTenantOptions {
  useManagement: boolean
}

interface WithMeta {
  _meta: {
    name: string
  }
}

const defaultMultiTenantOptions = {
  useManagement: true
}

class MultiTenant<Photon extends { disconnect: () => Promise<void> }> {
  PhotonTenant: any

  management?: Management
  tenants: { [name: string]: Photon & WithMeta }

  options: MultiTenantOptions

  constructor(options?: MultiTenantOptions) {
    this.options = { ...defaultMultiTenantOptions, ...options }

    this.PhotonTenant = this.requireTenant()

    if (this.options.useManagement) {
      this.management = new Management()
    }

    this.tenants = {}
  }

  private requireTenant() {
    return require(require.resolve(`@prisma/photon`, {
      paths: [process.cwd()]
    })).Photon
  }

  async get(name: string, options?: any) {
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

  async directGet(tenant: { name: string; url: string }, options?: any) {
    process.env.PMT_URL = tenant.url
    const photon = new this.PhotonTenant(options)

    photon._meta = {
      name: tenant.name
    }

    this.tenants[tenant.name] = photon

    return photon as Photon & WithMeta
  }

  async createTenant(tenant: { name: string; provider: string; url: string }, options?: any) {
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

    const tenantDS = await getTenantDatasource()

    if (tenantDS.connectorType !== tenant.provider) {
      throw new Error(
        'You cannot have tenants from different providers (See https://github.com/Errorname/prisma-multi-tenant/issues/8)'
      )
    }

    await this.management.create(tenant)

    await runDistant('prisma2 lift up --create-db', tenant)

    return this.directGet(tenant, options)
  }

  async deleteTenant(name: string) {
    if (!this.management) {
      throw new Error('Cannot use .deleteTenant(name) with `useManagement: false`')
    }

    if (this.tenants[name]) {
      delete this.tenants[name]
    }

    const tenant = await this.management.delete(name)

    await runDistant('prisma2 lift down --auto-approve', tenant)
  }

  disconnect() {
    return Promise.all([
      ...(this.management ? [this.management.disconnect()] : []),
      ...Object.values(this.tenants).map(t => t.disconnect())
    ])
  }
}

export { MultiTenant }
