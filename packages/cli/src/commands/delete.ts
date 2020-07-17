import chalk from 'chalk'

import { Management } from '@prisma-multi-tenant/shared'

import { Command, CommandArguments } from '../types'
import prompt from '../helpers/prompt'

import migrate from './migrate'

class Delete implements Command {
  name = 'delete'
  altNames = ['remove']
  args = [
    {
      name: 'name',
      description: 'Name of the tenant you want to delete',
    },
  ]
  options = [
    {
      name: 'force',
      description: 'Delete the tenant without asking for confirmation',
      boolean: true,
    },
  ]
  description = 'Delete one tenant'

  async execute(args: CommandArguments, management: Management) {
    console.log()

    const [name] = args.args

    if (
      !args.options.force &&
      !(await prompt.confirm(chalk`{red Are you sure you want to delete the tenant "${name}"?}`))
    ) {
      return
    }

    await migrate.migrateOneTenant(management, 'down', name)
    await management.delete(name)

    console.log(chalk`\n✅  {green Migrated down "${name}" and deleted it from management!}\n`)
    console.log(chalk`  {yellow {bold Note:} You are still in charge of deleting the database!}\n`)
  }
}

export default new Delete()
