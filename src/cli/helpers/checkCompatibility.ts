import path from 'path'
import chalk from 'chalk'

import { getNodeModules } from '../../shared/shell'

export default () => {
  try {
    const nodeModules = getNodeModules()
    const { version: prismaVersion } = require(path.join(nodeModules, '@prisma/cli/package.json'))
    const { peerDependencies } = require('../../../package.json')
    const prismaVersionRequired = peerDependencies['@prisma/cli'].replace('^', '')

    if (prismaVersion !== prismaVersionRequired) {
      console[process.env.PMT_TEST ? 'log' : 'warn'](
        chalk.yellow(
          `Warning: This version of prisma-multi-tenant is compatible with @prisma/cli@${prismaVersionRequired}, but you have @prisma/cli@${prismaVersion} installed. This may break in unexpected ways.`
        )
      )
    }
  } catch {
    console.warn(
      chalk.yellow`Warning: Couldn't verify version compatibility with @prisma/cli. Did you forget to install it locally?`
    )
  }
}
