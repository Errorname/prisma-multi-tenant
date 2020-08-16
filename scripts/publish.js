const inquirer = require('inquirer')

const { packages, docs, updatePackageJson, run } = require('./helpers')

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
  await updatePackageJson('root', versionNumber, dryRun)

  // 4. Publish packages (in this specific order)

  console.log('\n  Publishing packages')

  for (let name of packages) {
    await updatePackageJson(name, versionNumber, dryRun)
    await run(name, 'npm -s install')
    await run(name, `npm publish ${dryRun ? '--dry-run' : ''} --access public`)
    await run(name, 'npm link')
  }

  // 5. Update documentation

  console.log('\n  Updating documentation')

  for (let name of docs) {
    if (name === 'doc-redwood') {
      await updatePackageJson(name, versionNumber, dryRun, 'api')
      await run(name, 'yarn install --silent')
    } else {
      await updatePackageJson(name, versionNumber, dryRun)
      await run(name, 'npm -s install')
    }
  }

  console.log(`\n  ✅ Done! ${versionNumber} has been published! 👏\n`)
}

publish()
