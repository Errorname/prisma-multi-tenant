import { exec } from 'child_process'

import { Tenant } from './types'

const findNodeModules = require('find-node-modules')

export default (cmd: string, tenant?: Tenant, cwd?: string): Promise<string | Buffer> => {
  if (process.env.verbose == 'true') {
    console.log('  $> ' + cmd)
  }
  const nodeModules = findNodeModules({ cwd: process.cwd(), relative: false })[0]

  let env = {}

  if (tenant) {
    env = {
      PMT_PROVIDER: tenant.provider || tenant.connectorType,
      PMT_URL: tenant.url,
      PMT_OUTPUT: nodeModules + '/@generated/photon-multi-tenant'
    }
  }

  return new Promise((resolve, reject): void => {
    exec(
      cmd,
      {
        cwd: cwd || process.cwd(),
        env: {
          ...process.env,
          ...env
        }
      },
      (error: Error | null, stdout: string | Buffer, stderr: string | Buffer): void => {
        if (process.env.verbose == 'true') {
          console.log(stderr || stdout)
        }
        if (error) reject(error)
        resolve(stdout)
      }
    )
  })
}
