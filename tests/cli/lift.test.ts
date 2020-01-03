import { Project, initProject } from './helpers/project'
import { runShell } from './helpers/shell'

// If timeout error, increase the number
jest.setTimeout(300000)

describe('lift', () => {
  let project: Project

  beforeAll(async () => {
    project = await initProject('javascript/script', 'lift')

    await project.run('init --provider=sqlite --url=file:management.db')
    await project.run('delete db --force')
    await project.run('new --name=test1 --url=file:test1.db')
    await project.run('new --name=test2 --url=file:test2.db')
    await project.run('env test1 -- prisma2 lift save --name=test')
    await runShell(`cp helpers/seed.js ../playground/${project.path}/seed.js`, '../cli')
  })

  test('lift up one tenant', async () => {
    await project.run('lift test1 up')

    await project.expect().toSeed('test1')
    await project.expect().toSeed('test2', false)
  })

  test('lift up all tenants', async () => {
    await project.run('lift up')

    await project.expect().toSeed('test1')
    await project.expect().toSeed('test2')
  })

  /* TODO
  test('lift up management', () => {
    
  })*/

  test('lift down one tenant', async () => {
    await project.run('lift test1 down')

    await project.expect().toSeed('test1', false)
    await project.expect().toSeed('test2')
  })

  test('lift down all tenants', async () => {
    await project.run('lift down')

    await project.expect().toSeed('test1', false)
    await project.expect().toSeed('test2', false)
  })
})
