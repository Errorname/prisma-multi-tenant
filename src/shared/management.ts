import { Tenant } from './types'
import { PmtError } from './errors'
import { setManagementEnv } from './schema'
import { requireDistant } from './shell'
import { clientManagementPath } from './constants'

export default class Management {
  private options?: any
  private client?: any

  constructor(options?: any) {
    this.options = options
  }

  private async getClient(): Promise<any> {
    if (this.client) return this.client

    await setManagementEnv()

    const PrismaClient =
      this.options?.PrismaClient || requireDistant(clientManagementPath).PrismaClient

    this.client = new PrismaClient({
      debug: process.env.verbose == 'true',
      ...this.options
    })

    return this.client
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return await client.tenant.create({
        data: tenant
      })
    } catch (err) {
      if (err.code == 'P2002') throw new PmtError('tenant-already-exists', client.name)
      throw err
    }
  }

  async read(name: string): Promise<Tenant> {
    const client = await this.getClient()

    const tenant = await client.tenant.findOne({ where: { name } })

    if (!tenant) {
      throw new PmtError('tenant-does-not-exist', name)
    }

    return this.sanitizeTenant(tenant)
  }

  async exists(name: string): Promise<Boolean> {
    const client = await this.getClient()

    const tenant = await client.tenant.findOne({ where: { name } })

    return !!tenant
  }

  async list(): Promise<Tenant[]> {
    const client = await this.getClient()

    const tenants = await client.tenant.findMany()

    return tenants.map(this.sanitizeTenant)
  }

  async update(name: string, update: Tenant): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return await client.tenant.update({
        where: { name },
        data: update
      })
    } catch (err) {
      if (err.message.includes('RecordNotFound')) throw new PmtError('tenant-does-not-exist', name)
      throw err
    }
  }

  async delete(name: string): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return await client.tenant.delete({ where: { name } })
    } catch (err) {
      if (err.message.includes('RecordNotFound')) throw new PmtError('tenant-does-not-exist', name)
      throw err
    }
  }

  disconnect(): Promise<void> {
    if (!this.client) return Promise.resolve()

    return this.client.disconnect()
  }

  private sanitizeTenant(tenant: Tenant): Tenant {
    return {
      name: tenant.name,
      provider: tenant.provider,
      url: tenant.url
    }
  }
}
