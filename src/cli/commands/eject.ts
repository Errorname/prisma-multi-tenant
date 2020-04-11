import chalk from 'chalk'

import { Command } from '../../shared/types'
import { runShell, useYarn } from '../../shared/shell'

class Eject implements Command {
  name = 'eject'
  args = []
  description = 'Eject prisma-multi-tenant from your application'

  async execute() {
    console.log(chalk`\n  {yellow Ejecting \`prisma-multi-tenant\` from your app...}`)

    const yarnOrNpm = (await useYarn()) ? 'yarn remove' : 'npm uninstall'

    await runShell(`${yarnOrNpm} prisma-multi-tenant`)

    console.log(
      chalk`\n✅  {green Successfully removed \`prisma-multi-tenant\` from your app. Bye! 👋}\n`
    )
  }
}

export default new Eject()
