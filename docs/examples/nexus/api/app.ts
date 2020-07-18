import { use } from 'nexus'
import { prismaMultiTenant } from '@prisma-multi-tenant/nexus'

use(
  prismaMultiTenant({
    // This is the name of your first tenant, try with another one: "prod"
    tenantRouter: () => 'prod',
  })
)
