import fetch, { Response } from 'node-fetch'
import { Project, initProject } from './helpers/project'
import { runShell } from './helpers/shell'

// If timeout error, increase the number
jest.setTimeout(300000)

describe('dx', () => {
  let project: Project

  beforeAll(async () => {
    project = await initProject('javascript/script', 'dx')

    await project.run('init --provider=sqlite --url=file:management.db')
    await project.run('new --name=test1 --url=file:db1.db')
    await project.run('new --name=test2 --url=file:db2.db')
  })

  test('env', async () => {
    const env1 = await project.run('env test1 -- printenv PMT_URL')
    const env2 = await project.run('env test2 -- printenv PMT_URL')

    expect(env1).toEqual(expect.stringContaining('file:db1.db'))
    expect(env2).toEqual(expect.stringContaining('file:db2.db'))
  })

  // TODO: Find a way to kill all subprocess
  /*test('dev', async () => {
    const dev = project.exec('dev test1')

    await new Promise(resolve => setTimeout(resolve, 10000))

    const html = await fetch('http://localhost:5555').then((r: Response) => r.text())

    expect(html).toEqual(expect.stringContaining('Prisma Studio'))

    process.kill(-dev.pid)
  })*/

  test('studio', async () => {
    // TODO: Remove auto-open (See: prisma/lift#271)
    const studio1 = project.exec('studio test1')
    const studio2 = project.exec('studio test2 --port=5556')

    await new Promise(resolve => setTimeout(resolve, 3000))

    const html1 = await fetch('http://localhost:5555').then((r: Response) => r.text())
    const html2 = await fetch('http://localhost:5556').then((r: Response) => r.text())

    expect(html1).toEqual(expect.stringContaining('Prisma Studio'))
    expect(html2).toEqual(expect.stringContaining('Prisma Studio'))

    process.kill(-studio1.pid)
    process.kill(-studio2.pid)
  })
})
