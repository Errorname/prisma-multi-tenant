import { requireDistant } from '../shared/shell'
import { setManagementEnv } from '../shared/schema'
import { Datasource, Tenant } from '../shared/types'
import { photonManagementPath } from '../shared/constants'
import { CliError } from '../shared/errors'

class Management {
  photon: any

  async getPhoton() {
    if (this.photon) return this.photon

    await setManagementEnv()

    const { Photon } = requireDistant(photonManagementPath)

    this.photon = new Photon()

    return this.photon
  }

  async createTenant(tenant: Datasource) {
    const photon = await this.getPhoton()

    try {
      return await photon.tenants.create({
        data: tenant
      })
    } catch (err) {
      if (err.code == 'P2002') throw new CliError('tenant-already-exists', tenant.name)
      throw err
    }
  }

  async getTenant(name: string) {
    const photon = await this.getPhoton()

    const tenant = await photon.tenants.findOne({ where: { name } })

    if (!tenant) {
      throw new CliError('tenant-does-not-exists', name)
    }

    return this.sanitizeTenant(tenant)
  }

  async getTenants() {
    const photon = await this.getPhoton()

    const tenants = await photon.tenants.findMany()

    return tenants.map(this.sanitizeTenant)
  }

  deleteTenant(name: string) {
    return this.photon.tenants.delete({ where: { name } })
  }

  deleteTenants() {
    return this.photon.tenants.deleteMany()
  }

  sanitizeTenant(tenant: Tenant) {
    return {
      name: tenant.name,
      provider: tenant.provider,
      url: tenant.url
    }
  }

  async disconnect() {
    if (!this.photon) return

    return this.photon.disconnect()
  }
}

export default new Management()
