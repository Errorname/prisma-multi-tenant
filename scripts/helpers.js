const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const packages = ['shared', 'client', 'cli', 'nexus', 'blitz']

const docs = ['doc-basic-js', 'doc-basic-ts', 'doc-express', 'doc-apollo', 'doc-nexus']

const cwd = {
  root: path.join(__dirname, '../'),
  shared: path.join(__dirname, '../packages/shared'),
  client: path.join(__dirname, '../packages/client'),
  cli: path.join(__dirname, '../packages/cli'),
  nexus: path.join(__dirname, '../packages/nexus'),
  blitz: path.join(__dirname, '../packages/blitz'),
  'doc-basic-js': path.join(__dirname, '../docs/examples/basic-js'),
  'doc-basic-ts': path.join(__dirname, '../docs/examples/basic-ts'),
  'doc-express': path.join(__dirname, '../docs/examples/express'),
  'doc-apollo': path.join(__dirname, '../docs/examples/apollo'),
  'doc-nexus': path.join(__dirname, '../docs/examples/nexus'),
}

const updatePackageJson = async (name, versionNumber, dryRun) => {
  console.log(`\n€ ${name} > update package.json`)

  const packageJsonPath = path.join(cwd[name], `package.json`)

  const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath))

  packageJson.version = versionNumber

  if (!dryRun) {
    for (let packName of packages) {
      if (
        packageJson.dependencies &&
        packageJson.dependencies[`@prisma-multi-tenant/${packName}`]
      ) {
        packageJson.dependencies[`@prisma-multi-tenant/${packName}`] = `^${versionNumber}`
      }
    }
  }

  await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')
}

const run = (name, cmd) => {
  console.log(`\n$ ${name} > ${cmd}`)

  return new Promise((resolve, reject) =>
    exec(
      cmd,
      {
        cwd: cwd[name],
        env: process.env,
      },
      (error, stdout, stderr) => {
        if (error) {
          console.log(stderr)
          reject(error)
        }
        resolve(stdout)
      }
    )
  )
}

module.exports = {
  packages,
  docs,
  cwd,
  updatePackageJson,
  run,
}
