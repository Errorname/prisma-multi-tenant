const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant()

async function multiTenantMiddleware(req, res, next) {
  // Retrieve the name of the tenant any way you want (headers, token, ...)
  // Try with "prod" !
  const name = 'dev'

  // Retrieve the Prisma Client of the tenant
  const tenant = await multiTenant.get(name)

  // Keep the tenants for this request/response
  res.locals.prisma = tenant

  // Important, the `next()` instruction gives Express the control back on the execution of the request
  next()
}

module.exports = multiTenantMiddleware
