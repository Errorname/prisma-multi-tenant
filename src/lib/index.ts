import { Tenant } from '../shared/types'

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
  PhotonManagement: any
  PhotonTenant: any

  management?: any
  tenants: { [name: string]: Photon & WithMeta }

  options: MultiTenantOptions

  constructor(options?: MultiTenantOptions) {
    this.options = { ...defaultMultiTenantOptions, ...options }

    this.PhotonManagement = require(require.resolve(
      `@prisma/photon/prisma-multi-tenant/management`,
      {
        paths: [process.cwd()]
      }
    )).Photon
    this.PhotonTenant = require(require.resolve(`@prisma/photon`, {
      paths: [process.cwd()]
    })).Photon

    if (this.options.useManagement) {
      const managementUrl = new this.PhotonTenant().engine.datasources.find(
        (d: { name: string }) => d.name === 'management'
      ).url
      process.env.PMT_MANAGEMENT_URL = managementUrl
      this.management = new this.PhotonManagement()
    }
    this.tenants = {}
  }

  async get(name: string, options?: any) {
    if (this.tenants[name]) return this.tenants[name]

    if (!this.options.useManagement) {
      throw new Error('Cannot use .get(name) on an unknown tenant with `useManagement: false`')
    }

    const tenant = await this.management.tenants.findOne({ where: { name } })

    if (!tenant) {
      throw new Error(`The tenant with the name "${name}" does not exist`)
    }

    return this.directGet(tenant, options)
  }

  async directGet(tenant: Tenant, options?: any) {
    process.env.PMT_URL = tenant.url
    const photon = new this.PhotonTenant(options)

    photon._meta = {
      name: tenant.name
    }

    this.tenants[tenant.name] = photon

    return photon as Photon & WithMeta
  }

  disconnect() {
    return Promise.all([
      ...(this.management ? [this.management.disconnect()] : []),
      ...Object.values(this.tenants).map(t => t.disconnect())
    ])
  }
}

export { MultiTenant }
