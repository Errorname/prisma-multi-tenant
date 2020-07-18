const { packages, run } = require('./helpers.js')

const check = async () => {
  for (let name of packages) {
    await run(name, 'npm run lint')
    await run(name, 'npm run prettier')
  }

  await run('root', 'npm run test')

  console.log(`\n  ✅ Everything is OK 👏\n`)
}

check()
