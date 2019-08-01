import path from 'path'
import { PhotonTenants, PhotonTenant, Tenant } from '../shared/types'

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
    name: string,
    options?: Record<string, any>
  ): Promise<PhotonGenerated & PhotonTenant> {
    if (this.tenants[name]) return this.tenants[name] as PhotonGenerated & PhotonTenant

    try {
      const tenantConf = await this.management.tenants.findOne({ where: { name } })

      if (tenantConf.provider === 'sqlite') {
        let filePath = tenantConf.url

        if (filePath.startsWith('file:')) {
          filePath = filePath.slice(5)
        }

        tenantConf.url = 'file:' + path.resolve(process.cwd(), 'prisma/' + filePath)
      }

      return this.directGet(tenantConf, options)
    } catch (error) {
      if (error.message.includes('RecordDoesNotExist')) {
        throw new Error(`The tenant with the name "${name}" does not exist`)
      }
      throw error
    }
  }

  public async directGet<PhotonGenerated extends Record<string, any>>(
    conf: Tenant,
    options?: Record<string, any>
  ): Promise<PhotonGenerated & PhotonTenant> {
    const tenant = new PhotonTenant({
      ...(options || {}),
      datasources: {
        db: {
          connectorType: conf.provider || conf.connectorType,
          url: conf.url
        }
      }
    })

    this.tenants[conf.name] = tenant

    tenant._meta = {
      name: conf.name
    }

    return tenant as PhotonGenerated & PhotonTenant
  }

  public disconnect(): Promise<void[]> {
    return Promise.all([
      this.management.disconnect(),
      ...Object.values(this.tenants).map((tenant): void => tenant.disconnect())
    ])
  }
}

export default MultiTenant
