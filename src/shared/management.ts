import { Tenant } from './types'
import { PmtError } from './errors'
import { setManagementEnv } from './schema'
import { requireDistant } from './shell'
import { photonManagementPath } from './constants'

export default class Management {
  private options?: any
  private photon?: any

  constructor(options?: any) {
    this.options = options
  }

  private async getPhoton(): Promise<any> {
    if (this.photon) return this.photon

    await setManagementEnv()

    const Photon = this.options?.Photon || requireDistant(photonManagementPath).Photon

    this.photon = new Photon({
      debug: process.env.verbose == 'true',
      ...this.options
    })

    return this.photon
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const photon = await this.getPhoton()

    try {
      return await photon.tenants.create({
        data: tenant
      })
    } catch (err) {
      if (err.code == 'P2002') throw new PmtError('tenant-already-exists', tenant.name)
      throw err
    }
  }

  async read(name: string): Promise<Tenant> {
    const photon = await this.getPhoton()

    const tenant = await photon.tenants.findOne({ where: { name } })

    if (!tenant) {
      throw new PmtError('tenant-does-not-exist', name)
    }

    return this.sanitizeTenant(tenant)
  }

  async list(): Promise<Tenant[]> {
    const photon = await this.getPhoton()

    const tenants = await photon.tenants.findMany()

    return tenants.map(this.sanitizeTenant)
  }

  async update(name: string, update: Tenant): Promise<Tenant> {
    const photon = await this.getPhoton()

    try {
      return await photon.tenants.update({
        where: { name },
        data: update
      })
    } catch (err) {
      if (err.message.includes('RecordNotFound')) throw new PmtError('tenant-does-not-exist', name)
      throw err
    }
  }

  async delete(name: string): Promise<Tenant> {
    const photon = await this.getPhoton()

    try {
      return await photon.tenants.delete({ where: { name } })
    } catch (err) {
      if (err.message.includes('RecordNotFound')) throw new PmtError('tenant-does-not-exist', name)
      throw err
    }
  }

  disconnect(): Promise<void> {
    if (!this.photon) return Promise.resolve()

    return this.photon.disconnect()
  }

  private sanitizeTenant(tenant: Tenant): Tenant {
    return {
      name: tenant.name,
      provider: tenant.provider,
      url: tenant.url
    }
  }
}
