import { exec } from 'child_process'

import { Tenant } from './types'

const findNodeModules = require('find-node-modules')

export default (
  cmd: string,
  { url, provider, connectorType }: Tenant,
  cwd?: string
): Promise<string | Buffer> => {
  if (process.env.verbose == 'true') {
    console.log('  $> ' + cmd)
  }
  const nodeModules = findNodeModules({ cwd: process.cwd(), relative: false })[0]

  return new Promise((resolve, reject): void => {
    exec(
      cmd,
      {
        cwd: cwd || process.cwd(),
        env: {
          ...process.env,
          PMT_PROVIDER: provider || connectorType,
          PMT_URL: url,
          PMT_OUTPUT: nodeModules + '/@generated/photon-multi-tenant'
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
