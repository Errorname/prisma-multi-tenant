import { Middleware, MiddlewareRequest, MiddlewareResponse } from 'blitz'
// @ts-ignore
import { PrismaClientOptions } from '@prisma/client'

import multiTenant from './multi-tenant'

export const multiTenantMiddleware = (
  tenantRouter: (req: MiddlewareRequest, res: MiddlewareResponse) => string | Promise<string>,
  prismaOptions?: PrismaClientOptions
): Middleware => async (req, res, next) => {
  const name = await tenantRouter(req, res)
  const tenant = await multiTenant.get(name, prismaOptions)
  res.blitzCtx.db = tenant
  next()
}
