import path from 'path'
import chalk from 'chalk'

// This is quick and dirty, but currently works
const compareVersions = (a: string, b: string) => {
  const aParts = a.split('.')
  const bParts = b.split('.')

  for (const i in aParts) {
    if (aParts[i] > bParts[i]) {
      return 1
    } else if (aParts[i] < bParts[i]) {
      return -1
    }
  }

  return 0
}

export default async (): Promise<void> => {
  try {
    let prismaVersion

    try {
      prismaVersion = require('@prisma/cli/package.json').version
    } catch {
      console.warn(
        chalk.yellow`Warning: Couldn't find @prisma/cli in node_modules. Did you forget to install it locally?`
      )
      return
    }

    const { dependencies } = require(path.join(__dirname, '../../package.json'))
    const prismaVersionRequired = dependencies['@prisma/cli'].replace('^', '')

    if (compareVersions(prismaVersion, prismaVersionRequired) == -1) {
      console[process.env.PMT_TEST ? 'log' : 'warn'](
        chalk.yellow(
          `Warning: This version of prisma-multi-tenant is compatible with @prisma/cli@${prismaVersionRequired}, but you have @prisma/cli@${prismaVersion} installed. This may break in unexpected ways.`
        )
      )
      return
    }
  } catch (e) {
    console.log(e)
    console.warn(
      chalk.yellow`Warning: Couldn't verify version compatibility with @prisma/cli. Did you forget to install it locally?`
    )
  }
}
