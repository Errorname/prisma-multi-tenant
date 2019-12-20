import { exec } from 'child_process'
import fs from 'fs'

import { translateDatasourceUrl, getManagementDatasource } from '../helpers/schema'
import { datasourceProviders, photonManagementPath } from '../../shared/constants'
import { Datasource } from '../../shared/types'

const findNodeModules = require('find-node-modules')

// Run in this directory
export const runLocal = async (cmd: string) => {
  const nodeModules = findNodeModules({ cwd: process.cwd(), relative: false })[0]

  const managementDatasource = await getManagementDatasource()

  const providersEnv = datasourceProviders.reduce((acc: { [name: string]: string }, provider) => {
    acc['PMT_MANAGEMENT_PROVIDER_' + provider.toUpperCase()] =
      managementDatasource.connectorType == provider ? 'true' : 'false'
    return acc
  }, {})

  await runShell(cmd, {
    cwd: __dirname + '/../',
    env: {
      ...process.env,
      ...providersEnv,
      PMT_MANAGEMENT_URL: translateDatasourceUrl(managementDatasource.url),
      PMT_OUTPUT: nodeModules + '/' + photonManagementPath
    }
  })
}

// Run from the place where the CLI was called
export const runDistant = (cmd: string, tenant?: Datasource) => {
  return runShell(cmd, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PMT_URL: tenant ? tenant.url : 'PMT_TMP_URL'
    }
  })
}

export const runShell = (
  cmd: string,
  options?: { cwd: string; env: { [name: string]: string } }
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

export const writeFile = (path: string, content: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

export const fileExists = (path: string) => {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, err => {
      resolve(!err)
    })
  })
}

export const requireDistant = (name: string) => {
  return require(require.resolve(name, {
    paths: [process.cwd()]
  }))
}

export const useYarn = () => {
  return fileExists(process.cwd() + '/yarn.lock')
}
