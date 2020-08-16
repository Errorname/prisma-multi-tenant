import { MultiTenant, fromContext } from '@prisma-multi-tenant/redwood'

export const multiTenant = new MultiTenant()
export const db = fromContext()
