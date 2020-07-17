const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant()

const name = process.argv[2]

const main = async () => {
  const prisma = await multiTenant.get(name)

  const adminSeeded = await prisma.admin.create({
    data: {
      name: 'Jane',
      email: Math.random() + '@jane.doe',
      megaAdmin: true,
    },
  })

  const admin = await prisma.admin.findOne({
    where: { id: adminSeeded.id },
  })

  if (admin.name == 'Jane' && admin.email.endsWith('@jane.doe')) {
    console.log('Successfully seeded')
  } else {
    throw new Error('Unknown error during seeding')
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await multiTenant.disconnect()
  })
