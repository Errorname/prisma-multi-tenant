import { initProject } from './helpers/project'

// If timeout error, increase the number
jest.setTimeout(300000)

describe('init', () => {
  test('init with args', async () => {
    const project = await initProject('javascript/script', 'cli-init-with-args')

    await project.run('init --provider=sqlite --url=file:management.db')

    await project.expectFile('prisma/management.db').toExists()
    await project.expectFile('multi-tenancy-example.js').toExists()
    await project.expectFile('multi-tenancy-example.js').toContain("require('prisma-multi-tenant')")
  })
})
