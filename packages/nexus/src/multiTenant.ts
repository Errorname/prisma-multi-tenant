import { PrismaClient } from 'nexus-plugin-prisma/client'
import { MultiTenant } from '@prisma-multi-tenant/client'

export const multiTenant = new MultiTenant<PrismaClient>()
