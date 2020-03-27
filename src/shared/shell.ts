import { exec, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import { getManagementEnv } from './env'
import { clientManagementPath } from './constants'
import { Datasource } from './types'

let nodeModules: string

export const runShell = (
  cmd: string,
  options?: { cwd: string; env?: { [name: string]: string | undefined } }
): Promise<string | Buffer> => {
  if (process.env.verbose == 'true') {
    console.log('  $> ' + cmd)
  }

  return new Promise((resolve, reject) => {
    exec(cmd, options, (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
      if (process.env.verbose == 'true') {
        console.log(stderr || stdout)
      }
      if (error) reject(error)
      resolve(stdout)
    })
  })
}

export const spawnShell = (cmd: string): Promise<number> => {
  const [command, ...commandArguments] = cmd.split(' ')
  return new Promise(resolve =>
    spawn(command, commandArguments, {
      stdio: 'inherit',
      env: process.env,
      shell: true
    }).on('exit', (exitCode: number) => resolve(exitCode))
  )
}

export const fileExists = (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, err => {
      resolve(!err)
    })
  })
}

export const getNodeModules = (): string => {
  if (nodeModules) return nodeModules

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const findNodeModules = require('find-node-modules')
  nodeModules = findNodeModules({ cwd: process.cwd(), relative: false })[0]

  return nodeModules
}

export const getPrismaCliPath = (): string => {
  return path.join(getNodeModules(), '@prisma/cli/build/index.js')
}

// Run in this directory
export const runLocal = async (cmd: string): Promise<string | Buffer> => {
  const nodeModules = getNodeModules()

  const managementEnv = await getManagementEnv()

  return runShell(cmd, {
    cwd: __dirname + '/../cli',
    env: {
      ...process.env,
      ...managementEnv,
      PMT_OUTPUT: nodeModules + '/' + clientManagementPath
    }
  })
}

// Run from the place where the CLI was called
export const runDistant = (cmd: string, tenant?: Datasource): Promise<string | Buffer> => {
  return runShell(cmd, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: tenant?.url || process.env.DATABASE_URL || 'PMT_TMP_URL'
    }
  })
}

export const runLocalPrisma = async (cmd: string): Promise<string | Buffer> => {
  return runLocal(`"${getPrismaCliPath()}" ${cmd}`)
}

export const runDistantPrisma = async (
  cmd: string,
  tenant?: Datasource,
  withTimeout = true
): Promise<string | Buffer> => {
  const promise = runDistant(`"${getPrismaCliPath()}" ${cmd}`, tenant)

  if (!withTimeout) {
    return promise
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const altCmd =
        (tenant?.name ? `prisma-multi-tenant env ${tenant.name} -- ` : '') +
        'npx @prisma/cli ' +
        cmd
      console.log(
        chalk`\n  {yellow Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\`}\n`
      )
    }, 30 * 1000)

    promise
      .then(() => {
        clearTimeout(timeout)
        resolve()
      })
      .catch(reject)
  })
}

export const readFile = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

export const writeFile = (path: string, content: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

export const requireDistant = (name: string): any => {
  return require(require.resolve(name, {
    paths: [
      process.cwd() + '/node_modules/',
      process.cwd(),
      ...(require.main?.paths || []),
      __dirname + '/../../../'
    ]
  }))
}

export const useYarn = (): Promise<boolean> => {
  return fileExists(process.cwd() + '/yarn.lock')
}
