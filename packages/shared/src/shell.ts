import { exec, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

import { PmtError } from './errors'
import { clientManagementPath } from './constants'
import { Datasource } from './types'
import { getManagementEnv } from './env'

// Cache nodeModulesPath
let nodeModulesPath: string

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
  return new Promise((resolve) =>
    spawn(command, commandArguments, {
      stdio: 'inherit',
      env: process.env,
      shell: true,
    }).on('exit', (exitCode: number) => resolve(exitCode))
  )
}

export const fileExists = (path: string): Promise<boolean> => {
  return fs.promises
    .access(path, fs.constants.R_OK)
    .then(() => true)
    .catch(() => false)
}

export const getNodeModules = async (cwd?: string): Promise<string> => {
  if (nodeModulesPath) return nodeModulesPath

  let currentPath = cwd || process.cwd()

  do {
    if (await fileExists(path.join(currentPath, 'node_modules'))) {
      nodeModulesPath = path.join(currentPath, 'node_modules')
    } else {
      if (currentPath != path.join(currentPath, '../')) {
        currentPath = path.join(currentPath, '../')
      } else {
        throw new PmtError('no-nodes-modules')
      }
    }
  } while (!nodeModulesPath)

  return nodeModulesPath
}

// Run in this directory
export const runLocal = async (cmd: string): Promise<string | Buffer> => {
  const nodeModules = await getNodeModules()

  const managementEnv = await getManagementEnv()

  // Fixes a weird bug that would not use the provided PMT_OUTPUT env
  delete process.env.INIT_CWD

  return runShell(cmd, {
    cwd: path.join(nodeModules, '@prisma-multi-tenant/shared/build'),
    env: {
      ...process.env,
      ...managementEnv,
      PMT_OUTPUT: path.join(nodeModules, clientManagementPath),
    },
  })
}

// Run from the place where the CLI was called
export const runDistant = (cmd: string, tenant?: Datasource): Promise<string | Buffer> => {
  return runShell(cmd, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: tenant?.url || process.env.DATABASE_URL || 'PMT_TMP_URL',
    },
  })
}

export const getPrismaCliPath = async (): Promise<string> => {
  const nodeModules = await getNodeModules()
  return path.join(nodeModules, '@prisma/cli/build/index.js')
}

export const isPrismaCliLocallyInstalled = async (): Promise<boolean> => {
  return fileExists(await getPrismaCliPath())
}

export const runLocalPrisma = async (cmd: string): Promise<string | Buffer> => {
  const prismaCliPath = await getPrismaCliPath()
  return runLocal(`"${prismaCliPath}" ${cmd}`)
}

export const runDistantPrisma = async (
  cmd: string,
  tenant?: Datasource,
  withTimeout = true
): Promise<string | Buffer> => {
  const prismaCliPath = await getPrismaCliPath()
  const promise = runDistant(`"${prismaCliPath}" ${cmd}`, tenant)

  if (!withTimeout) {
    return promise
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const altCmd =
        (tenant?.name ? `prisma-multi-tenant env ${tenant.name} -- ` : '') +
        'npx @prisma/cli ' +
        cmd
      let chalk
      try {
        chalk = require('chalk')
      } catch {}
      if (chalk) {
        console.log(
          chalk`\n  {yellow Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\`}\n`
        )
      } else {
        console.log(`Note: Prisma seems to be unresponnsive. Try running \`${altCmd.trim()}\`}`)
      }
    }, 30 * 1000)

    promise
      .then(() => {
        clearTimeout(timeout)
        resolve()
      })
      .catch((err) => {
        clearTimeout(timeout)
        reject(err)
      })
  })
}

export const requireDistant = (name: string): any => {
  // Keep previous env so that the required module doesn't update it
  const previousEnv = { ...process.env }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const required = require(require.resolve(name, {
    paths: [
      process.cwd() + '/node_modules/',
      process.cwd(),
      ...(require.main?.paths || []),
      __dirname + '/../../../',
    ],
  }))
  process.env = previousEnv
  return required
}
