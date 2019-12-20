import { Command, CommandArguments } from '../../shared/types'
import prompt from '../helpers/prompt'
import chalk = require('chalk')
import management from '../management'
import lift from './lift'

class Delete implements Command {
  name = 'delete'
  args = [
    {
      name: 'name',
      optional: true,
      description: 'Name of the tenant you want to delete'
    }
  ]
  description = 'Delete one or more tenants'

  async execute(args: CommandArguments) {
    console.log()

    const [name] = args.args

    if (name) {
      return this.deleteOne(name)
    }

    return this.deleteAll()
  }

  async deleteOne(name: string) {
    if (
      !(await prompt.confirm(chalk`{red Are you sure you want to delete the tenant "${name}"?}`))
    ) {
      return
    }

    await lift.liftOneTenant('down', name)
    await management.deleteTenant(name)

    console.log(chalk`\n✅  {green Lifted down "${name}" and deleted it from management!}\n`)
    console.log(chalk`  {blue Note: You are still in charge of deleting the database!}\n`)
  }

  async deleteAll() {
    if (!(await prompt.confirm(chalk`{red Are you sure you want to delete *all* tenants?}`))) {
      return
    }

    await lift.liftAllTenants('down')
    await management.deleteTenants()

    console.log(chalk`\n✅  {green Lifted down all tenants and deleted them from management!}\n`)
    console.log(chalk`  {blue Note: You are still in charge of deleting the databases!}\n`)
  }
}

export default new Delete()
