import { initProject } from './helpers/project'
import { runShell } from './helpers/shell'

// If timeout error, increase the number
jest.setTimeout(300000)

describe('init', () => {
  test('init with url', async () => {
    const project = await initProject('cli-init-with-url')

    await project.run('init --url=file:management.db')

    await project.expectFile('prisma/management.db').toExists()
    await project.expectFile('multi-tenancy-example.js').toExists()
    await project
      .expectFile('multi-tenancy-example.js')
      .toContain("require('@prisma-multi-tenant/client')")
  })

  test('init without example file', async () => {
    const project = await initProject('cli-init-without-example')

    await project.run('init --url=file:management.db --no-example')

    await project.expectFile('prisma/management.db').toExists()
    await project.expectFile('multi-tenancy-example.js').toExists(false)
  })

  test('init with schema', async () => {
    const project = await initProject('cli-init-with-schema')

    runShell('mv prisma/schema.prisma prisma/schema2.prisma', project.path)

    await project.run('init --url=file:management.db --schema prisma/schema2.prisma')

    await project.expectFile('prisma/management.db').toExists()
    await project.expectFile('multi-tenancy-example.js').toExists()
  })
})
