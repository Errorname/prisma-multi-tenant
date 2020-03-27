import { runShell, fileExists, spawnCommand } from './shell'

export interface Project {
  path: string
  name: string
}

export class Project {
  constructor({ name, path }: { name: string; path: string }) {
    this.name = name
    this.path = path
  }

  async run(cmd: string) {
    console.log(`Running "prisma-multi-tenant ${cmd}" on "${this.name}"`)
    const ret = await runShell('prisma-multi-tenant ' + cmd, this.path)

    return ret
  }

  exec(cmd: string) {
    console.log(`Running "prisma-multi-tenant ${cmd}" on "${this.name}"`)

    return spawnCommand('prisma-multi-tenant ' + cmd, this.path)
  }

  expect() {
    return {
      toSeed: async (tenant: string, expected: boolean = true, seedFile: string = 'seed.js') => {
        const results = await runShell(
          `dotenv -e prisma/.env node ${seedFile} ${tenant}`,
          this.path
        ).catch(e => e)
        if (expected) {
          expect(results).toEqual(expect.stringContaining('Successfully seeded'))
        } else {
          expect(results).not.toEqual(expect.stringContaining('Successfully seeded'))
        }
      }
    }
  }

  expectFile(path: string) {
    return {
      toExists: async (expected: boolean = true) => {
        const exists = await fileExists(this.path + '/' + path)
        expect(exists).toBe(expected)
      },
      toContain: async (expected: string) => {
        const content = await runShell(`cat ${path}`, this.path)
        expect(content).toEqual(expect.stringContaining(expected))
      }
    }
  }
}

export const initProject = async (name: string): Promise<Project> => {
  console.log(`Initializing ${name} project...`)

  await runShell(`rm -Rf test-${name} && cp -R example test-${name}`)

  await runShell(`cd test-${name} && npm -s install`)

  return new Project({ name, path: 'test-' + name })
}
