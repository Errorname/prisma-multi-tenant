import path from 'path'
import fs from 'fs'

import { Management, runDistantPrisma, requireDistant } from '@prisma-multi-tenant/shared'

interface MultiTenantOptions {
  useManagement?: boolean
  tenantOptions?: any
  PrismaClient?: any
  PrismaClientManagement?: any
}

interface WithMeta {
  _meta: {
    name: string
  }
}

interface Tenant {
  name: string
  url: string
}

const defaultMultiTenantOptions = {
  useManagement: true,
}

class MultiTenant<PrismaClient extends { $disconnect: () => Promise<void> }> {
  ClientTenant: any

  management?: Management
  tenants: { [name: string]: PrismaClient & WithMeta }

  options: MultiTenantOptions

  constructor(options?: MultiTenantOptions) {
    this.options = { ...defaultMultiTenantOptions, ...options }

    this.loadEnv()

    this.ClientTenant = this.requireTenant()

    if (this.options.useManagement) {
      this.management = new Management({ PrismaClient: this.options.PrismaClientManagement })
    }

    this.tenants = {}
  }

  private loadEnv(): void {
    // Try loading env variables
    try {
      const envFile = fs.readFileSync(path.join(process.cwd(), 'prisma/.env'), 'utf-8')
      const envVars = envFile
        .split(/\n/g)
        .map((l) => l.trim())
        .filter((l) => !(l == '' || l.startsWith('#')))
        .map((l) =>
          l
            .split('=')
            .map((s) => s.trim())
            .slice(0, 2)
        )
      envVars.forEach(([key, val]) => {
        if (!process.env[key]) {
          process.env[key] = val
        }
      })
    } catch {
      // Couldn't parse prisma/.env
    }
  }

  private requireTenant(): any {
    if (this.options.PrismaClient) {
      return this.options.PrismaClient
    }
    return requireDistant(`@prisma/client`).PrismaClient
  }

  private isCliAvailable(method: string): boolean {
    try {
      require('@prisma/cli')
    } catch {
      if (!process.env.PMT_TEST) {
        throw new Error(
          `@prisma/cli needs to be installed in order to use this MultiTenant.${method}(), but it doesn't seem to be present. Did you forget to install it?`
        )
      }
    }
    return true
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
    const client = new this.ClientTenant({ ...this.options.tenantOptions, ...options })

    client._meta = {
      name: tenant.name,
    }

    this.tenants[tenant.name] = client

    return client as PrismaClient & WithMeta
  }

  async createTenant(tenant: Tenant, options?: any): Promise<PrismaClient & WithMeta> {
    if (!this.management) {
      throw new Error('Cannot use .createTenant(tenant, options) with `useManagement: false`')
    }

    if (tenant.name == 'management') {
      throw new Error('The name "management" is reserved. You cannot use it for a tenant.')
    }

    this.isCliAvailable('createTenant')

    await this.management.create(tenant)

    await runDistantPrisma('migrate up --create-db --experimental', tenant, false)

    return this.directGet(tenant, options)
  }

  async deleteTenant(name: string): Promise<Tenant> {
    if (!this.management) {
      throw new Error('Cannot use .deleteTenant(name) with `useManagement: false`')
    }

    this.isCliAvailable('deleteTenant')

    if (this.tenants[name]) {
      delete this.tenants[name]
    }

    const tenant = await this.management.delete(name)

    await runDistantPrisma('migrate down --experimental', tenant, false)

    return tenant
  }

  async existsTenant(name: string): Promise<boolean> {
    if (!this.management) {
      throw new Error('Cannot use .existsTenant(name) with `useManagement: false`')
    }

    if (this.tenants[name]) return true

    return this.management.exists(name)
  }

  $disconnect(): Promise<void[]> {
    return Promise.all([
      ...(this.management ? [this.management.$disconnect()] : []),
      ...Object.values(this.tenants).map((t) => t.$disconnect()),
    ])
  }
}

// Fix for Vercel + Next issue
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const requirePrismaManagement = () => require('.prisma-multi-tenant/management').PrismaClient

export { MultiTenant, requirePrismaManagement }
