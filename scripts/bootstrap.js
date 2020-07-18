const { packages, run } = require('./helpers.js')

const bootstrap = async () => {
  for (let name of packages) {
    await run(name, 'npm install')
  }
}

bootstrap()
