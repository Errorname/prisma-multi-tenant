import { Command } from '../types'

import chalk from 'chalk'
import Table from 'cli-table3'

import management from '../management'

class List implements Command {
  name = 'list'
  args = []
  description = 'List all tenants'

  useManagement = true

  async execute() {
    const tenants = await management.getAll()

    const table = new Table({
      head: [chalk.green.bold('Name'), chalk.green.bold('Provider'), chalk.green('URL')]
    }) as Table.HorizontalTable

    tenants.forEach(({ name, provider, url }: { name: string; provider?: string; url: string }) => {
      table.push([name, provider, url])
    })

    console.log(chalk`
  {green.bold List of available tenants}

${table.toString()}
  `)
  }
}

export default new List()
