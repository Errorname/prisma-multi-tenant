import { PhotonTenants, PhotonTenant } from './types'

const PhotonManagement = require(require.resolve(`@generated/photon-multi-tenant`, {
  paths: [process.cwd()]
}))
const PhotonTenant = require(require.resolve(`@generated/photon`, {
  paths: [process.cwd()]
}))

class MultiTenant {
  private management: any
  private tenants: PhotonTenants = {}

  public constructor() {
    this.management = new PhotonManagement()
  }

  public async get<PhotonGenerated extends Record<string, any>>(
    name: string
  ): Promise<PhotonGenerated & PhotonTenant> {
    if (this.tenants[name]) return this.tenants[name] as PhotonGenerated & PhotonTenant

    try {
      const tenantConf = await this.management.tenants.findOne({ where: { name } })

      const tenant = new PhotonTenant({
        datasources: {
          db: {
            connectorType: tenantConf.provider,
            url: tenantConf.url
          }
        }
      })

      this.tenants[name] = tenant

      return tenant as PhotonGenerated & PhotonTenant
    } catch (error) {
      if (error.message.includes('RecordDoesNotExist')) {
        throw new Error(`The tenant with the name "${name}" does not exist`)
      }
      throw error
    }
  }

  public disconnect(): Promise<void[]> {
    return Promise.all([
      this.management.disconnect(),
      ...Object.values(this.tenants).map((tenant): void => tenant.disconnect())
    ])
  }
}

export default MultiTenant
