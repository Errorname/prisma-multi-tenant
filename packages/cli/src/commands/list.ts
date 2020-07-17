import Table from 'cli-table3'
import chalk from 'chalk'

import { Management } from '@prisma-multi-tenant/shared'

import { Command, CommandArguments } from '../types'

class List implements Command {
  name = 'list'
  args = []
  options = [
    {
      name: 'json',
      description: 'Print using JSON format',
      boolean: true,
    },
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
      head: [chalk.green.bold('Name'), chalk.green('URL')],
    })

    for (const tenant of tenants) {
      table.push([
        tenant.name,
        tenant.url.length > 25
          ? tenant.url.substr(0, 11) + '...' + tenant.url.substr(-11)
          : tenant.url,
      ])
    }

    console.log(chalk`\n  {green.bold List of available tenants}
      ${'\n' + table.toString()}
    `)
  }
}

export default new List()
