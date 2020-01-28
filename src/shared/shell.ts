import { exec } from 'child_process'
import fs from 'fs'

import { getManagementEnv } from './schema'
import { clientManagementPath } from './constants'
import { Datasource } from './types'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const findNodeModules = require('find-node-modules')

let distantBin: string

export const runShell = (
  cmd: string,
  options?: { cwd: string; env?: { [name: string]: string } }
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

export const fileExists = (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, err => {
      resolve(!err)
    })
  })
}

export const findBin = async (): Promise<string> => {
  if (distantBin !== undefined) return distantBin

  const binFolder =
    ((await runShell('npm bin', {
      cwd: process.cwd()
    })) as string).trim() + '/'

  if (await fileExists(binFolder + 'prisma2')) {
    distantBin = binFolder
  } else {
    distantBin = ''
  }

  return distantBin
}

// Run in this directory
export const runLocal = async (cmd: string): Promise<string | Buffer> => {
  const nodeModules = findNodeModules({ cwd: process.cwd(), relative: false })[0]

  const managementEnv = await getManagementEnv()

  const baseFolder = await findBin()

  return runShell(baseFolder + cmd, {
    cwd: __dirname + '/../cli',
    env: {
      ...process.env,
      ...managementEnv,
      PMT_OUTPUT: nodeModules + '/' + clientManagementPath
    }
  })
}

// Run from the place where the CLI was called
export const runDistant = async (cmd: string, tenant?: Datasource): Promise<string | Buffer> => {
  const baseFolder = await findBin()

  return runShell(baseFolder + cmd, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PMT_URL: tenant ? tenant.url : 'PMT_TMP_URL'
    }
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
