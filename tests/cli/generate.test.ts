import { initProject } from './helpers/project'

// If timeout error, increase the number
jest.setTimeout(300000)

describe('generate', () => {
  test('generate', async () => {
    const project = await initProject('cli-generate')

    await project.run('init --provider=sqlite --url=file:management.db')

    await project.run('generate')

    await project.expectFile('node_modules/@prisma/client').toExists()
    await project.expectFile('node_modules/@prisma/prisma-multi-tenant')
  })
})
