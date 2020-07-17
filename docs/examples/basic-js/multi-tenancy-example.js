const { MultiTenant } = require('@prisma-multi-tenant/client')

// This is the name of your first tenant, try with another one: "prod"
const name = 'dev'

const multiTenant = new MultiTenant()

async function main() {
  // Prisma-multi-tenant will connect to the correct tenant
  const prisma = await multiTenant.get(name)

  // You keep the same interface as before
  const users = await prisma.user.findMany()

  console.log(users)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await multiTenant.disconnect()
  })
