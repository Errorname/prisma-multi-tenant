const express = require('express')

const multiTenancy = require('./multi-tenant')

const app = express()

// Adds multi-tenancy middleware
app.use(multiTenancy)

app.get('/', async (req, res) => {
  const users = await res.locals.prisma.user.findMany()

  res.send({ users })
})

app.listen(4000, () => console.log('\n  🚀 Server started at http://localhost:4000'))
