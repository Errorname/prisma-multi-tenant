import Table from 'cli-table3'
import chalk from 'chalk'

import { Command, CommandArguments } from '../../shared/types'
import Management from '../../shared/management'

class List implements Command {
  name = 'list'
  args = []
  options = [
    {
      name: 'json',
      description: 'Print using JSON format'
    }
  ]
  description = 'List all tenants'

  async execute(args: CommandArguments, management: Management) {
    if (!args.options.json) {
      console.log('\n  Fetching available tenants...')
    }

    const tenants = await management.list()

    if (args.options.json) {
      console.log(JSON.stringify(tenants, null, 2))
      return
    }

    const table = new Table({
      head: [chalk.green.bold('Name'), chalk.green.bold('Provider'), chalk.green('URL')]
    }) as Table.HorizontalTable

    for (let tenant of tenants) {
      table.push([
        tenant.name,
        tenant.provider,
        tenant.url.length > 21
          ? tenant.url.substr(0, 9) + '...' + tenant.url.substr(-9)
          : tenant.url
      ])
    }

    console.log(chalk`\n  {green.bold List of available tenants}
      ${'\n' + table.toString()}
    `)
  }
}

export default new List()
