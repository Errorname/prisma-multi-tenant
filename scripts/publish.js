const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const inquirer = require('inquirer')

// 0. Handle arguments & options
const [versionNumber, ...options] = process.argv.slice(2)
const dryRun = options.includes('--dry-run')

const publish = async () => {
  // 1. Confirm version number and dry-run

  if (!versionNumber) {
    throw new Error('No version number provided')
  }

  console.log(`\n  Version number used: ${versionNumber}\n`)
  if (
    !(
      await inquirer.prompt([
        {
          name: 'confirm',
          type: 'confirm',
          message: 'Are you sure this is the right version number?',
        },
      ])
    ).confirm
  ) {
    return process.exit(1)
  }

  if (!dryRun) {
    console.log(`\n  This is NOT A DRY RUN. I repeat: THIS IS NOT A DRY RUN!!!\n`)
    if (
      !(
        await inquirer.prompt([
          {
            name: 'dryrun',
            type: 'confirm',
            message: 'Do you want to continue?',
          },
        ])
      ).dryrun
    ) {
      return process.exit(1)
    }
  }

  // 2. Check lint, prettier & tests

  console.log('\n  Checking lint, prettier & tests. Can take up to a minute...')
  await run('root', 'npm run check')

  // 3. Update root package version
  await updatePackageJson('root')

  // 4. Publish packages (in this specific order)

  console.log('\n  Publishing packages')
  const packages = [
    /*'shared', 'client', 'cli'*/
  ]

  for (let name of packages) {
    await updatePackageJson(name)
    await run(name, 'npm -s install')
    await run(name, `npm publish ${dryRun ? '--dry-run' : ''} --access public`)
    await run(name, 'npm link')
  }

  // 5. Update documentation

  console.log('\n  Updating documentation')
  const docs = ['doc-basic-js', 'doc-basic-ts']

  for (let name of docs) {
    await updatePackageJson(name)
    await run(name, 'npm -s install')
  }

  console.log(`\n  Done! ${versionNumber} has been published!`)
}

publish()

// Helpers

const cwd = {
  root: path.join(__dirname, '../'),
  shared: path.join(__dirname, '../packages/shared'),
  client: path.join(__dirname, '../packages/client'),
  cli: path.join(__dirname, '../packages/cli'),
  'doc-basic-js': path.join(__dirname, '../docs/examples/basic-js'),
  'doc-basic-ts': path.join(__dirname, '../docs/examples/basic-ts'),
}

const updatePackageJson = async (name) => {
  console.log(`\n€ ${name} > update package.json`)

  const packageJsonPath = path.join(cwd[name], `package.json`)

  const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath))

  packageJson.version = versionNumber

  if (!dryRun) {
    if (packageJson.dependencies && packageJson.dependencies['@prisma-multi-tenant/shared']) {
      packageJson.dependencies['@prisma-multi-tenant/shared'] = `^${versionNumber}`
    }
    if (packageJson.dependencies && packageJson.dependencies['@prisma-multi-tenant/client']) {
      packageJson.dependencies['@prisma-multi-tenant/client'] = `^${versionNumber}`
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
