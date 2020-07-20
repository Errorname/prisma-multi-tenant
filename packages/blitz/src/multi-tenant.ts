import { PrismaClient } from '@prisma/client'
import { MultiTenant } from '@prisma-multi-tenant/client'

let multiTenant: MultiTenant<PrismaClient>

if (process.env.NODE_ENV === 'production') {
  multiTenant = new MultiTenant<PrismaClient>()
} else {
  // Ensure the multi-tenant instance is re-used during hot-reloading
  // Otherwise, a new management client will be created on every reload
  // @ts-ignore
  global['multi-tenant'] = global['multi-tenant'] || new MultiTenant<PrismaClient>()
  // @ts-ignore
  multiTenant = global['multi-tenant']
}

export default multiTenant
