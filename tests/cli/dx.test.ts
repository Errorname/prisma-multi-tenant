import fetch, { Response } from 'node-fetch'
import { Project, initProject } from './helpers/project'

// If timeout error, increase the number
jest.setTimeout(300000)

describe('dx', () => {
  let project: Project

  beforeAll(async () => {
    project = await initProject('javascript/script', 'cli-dx')

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

  test('studio', async () => {
    // TODO: Remove auto-open (See: prisma/lift#271)
    const studio1 = project.exec('studio test1')
    const studio2 = project.exec('studio test2 --port=5556')

    const sleep = (s: number) => new Promise(resolve => setTimeout(resolve, s * 1000))

    const connect = async (port: number) => {
      let html
      try {
        html = await fetch('http://localhost:' + port).then((r: Response) => r.text())
      } catch {
        await sleep(5)
        try {
          html = await fetch('http://localhost:' + port).then((r: Response) => r.text())
        } catch {
          await sleep(30)
          try {
            html = await fetch('http://localhost:' + port).then((r: Response) => r.text())
          } catch {
            html = "Error: couldn't connect to http://localhost:" + port
          }
        }
      }
      return html
    }

    await sleep(5)

    const [html1, html2] = await Promise.all([connect(5555), connect(5556)])

    process.kill(-studio1.pid)
    process.kill(-studio2.pid)

    expect(html1).toEqual(expect.stringContaining('Prisma Studio'))
    expect(html2).toEqual(expect.stringContaining('Prisma Studio'))
  })
})
