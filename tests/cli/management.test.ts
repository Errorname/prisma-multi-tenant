import { initProject, Project } from './helpers/project'

// If timeout error, increase the number
jest.setTimeout(300000)

describe('management', () => {
  let project: Project

  beforeAll(async () => {
    project = await initProject('javascript/script', 'management')

    await project.run('init --provider=sqlite --url=file:management.db')
  })

  test('add tenants with args', async () => {
    // We can either use "new" or "add"
    await project.run('new --name=test1 --url=file:test1.db')
    await project.run('add --name test2 --url file:test2.db')

    // Can't add "management"
    await project.run('new --name=management --url=file:another.db').catch(() => {})

    await project.expectFile('prisma/test1.db').toExists()
    await project.expectFile('prisma/test2.db').toExists()
    await project.expectFile('prisma/another.db').toExists(false)
  })

  test('list tenants', async () => {
    const tenants = [
      {
        name: 'db',
        provider: 'sqlite',
        url: 'file:dev.db'
      },
      {
        name: 'test1',
        provider: 'sqlite',
        url: 'file:test1.db'
      },
      {
        name: 'test2',
        provider: 'sqlite',
        url: 'file:test2.db'
      }
    ]

    const textList = await project.run('list')

    for (let tenant of tenants) {
      expect(textList).toEqual(expect.stringContaining(tenant.name))
      expect(textList).toEqual(expect.stringContaining(tenant.url))
    }

    const jsonList = await project.run('list --json')

    expect(JSON.parse(jsonList)).toEqual(tenants)
  })

  test('delete tenants by force', async () => {
    // We can either use "delete" or "remove"
    await project.run('delete db --force')
    await project.run('remove test2 --force')

    const tenants = [
      {
        name: 'test1',
        provider: 'sqlite',
        url: 'file:test1.db'
      }
    ]

    const list = await project.run('list --json')

    expect(JSON.parse(list)).toEqual(tenants)
  })
})
