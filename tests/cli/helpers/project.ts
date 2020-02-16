import { runShell, fileExists, spawnCommand } from './shell'

export interface Project {
  path: string
  type: string
  name: string
}

export class Project {
  constructor({ type, name, path }: { type: string; name: string; path: string }) {
    this.type = type
    this.name = name
    this.path = path
  }

  async run(cmd: string) {
    console.log(`Running "prisma-multi-tenant ${cmd}" on "${this.name}"`)
    const ret = await runShell('prisma-multi-tenant ' + cmd, this.path)

    if (cmd.startsWith('init')) {
      await runShell('npm link prisma-multi-tenant', this.path)
    }

    return ret
  }

  exec(cmd: string) {
    console.log(`Running "prisma-multi-tenant ${cmd}" on "${this.name}"`)

    return spawnCommand('prisma-multi-tenant ' + cmd, this.path)
  }

  expect() {
    return {
      toSeed: async (tenant: string, expected: boolean = true) => {
        const results = await runShell(`node seed.js ${tenant}`, this.path).catch(e => e)
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

export const initProject = async (type: string, name: string): Promise<Project> => {
  console.log(`Initializing ${name} project...`)

  await runShell(`rm -Rf test-${name} && cp -R prisma-examples/${type} test-${name}`)

  await runShell(`cd test-${name} && npm -s install`)

  // await runShell(`cd test-${name} && npm link prisma-multi-tenant`)

  return new Project({ type, name, path: 'test-' + name })
}
