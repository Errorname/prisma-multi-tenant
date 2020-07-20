const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant()

async function createContext({ req }) {
  // Retrieve the name of the tenant any way you want (headers, token, ...)
  // Try with "prod" !
  const name = 'dev'

  // Retrieve the Prisma Client of the tenant
  const tenant = await multiTenant.get(name)

  // Add the tenant to the context, to be used in resolvers
  return {
    db: tenant,
  }
}

module.exports = { createContext }
