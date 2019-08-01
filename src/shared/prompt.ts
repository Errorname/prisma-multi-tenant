import inquirer from 'inquirer'
import chalk from 'chalk'

import args from './args'
import errors from './errors'

import { Tenant } from './types'

const confirm = async (message: string): Promise<boolean> => {
  const { confirm } = await inquirer.prompt([
    {
      name: 'confirm',
      type: 'confirm',
      message
    }
  ])

  return confirm
}

const tenantConf = async (_args: string[]): Promise<Tenant> => {
  let options: { [key: string]: string } = args.getOptions(_args)

  if (options.name || options.provider || options.url) {
    if (!(options.name && options.provider && options.url)) {
      errors.missingTenantOptions()
    }
  } else {
    console.log(chalk.green('Please enter the following informations:'))
    options = await inquirer.prompt([
      {
        name: 'name',
        type: 'input',
        message: 'Name of the tenant:'
      },
      {
        name: 'provider',
        type: 'list',
        message: 'Database provider:',
        choices: ['sqlite', 'mysql', 'postgresql', 'mongodb']
      },
      { name: 'url', type: 'input', message: 'Database url:' }
    ])

    console.log()
    console.log(options)
    console.log()

    if (!(await confirm('Are you sure of your inputs?'))) {
      process.exit(0)
    }
  }

  return (options as unknown) as Tenant
}

const managementConf = async (_args: string[]): Promise<Tenant> => {
  let options: { [key: string]: string } = args.getOptions(_args)

  if (options.provider || options.url) {
    if (!(options.provider && options.url)) {
      errors.missingManagementOptions()
    }
  } else {
    console.log(chalk.green('Please enter the following informations:'))
    options = await inquirer.prompt([
      {
        name: 'provider',
        type: 'list',
        message: 'Database provider:',
        choices: ['sqlite', 'mysql', 'postgresql', 'mongodb']
      },
      { name: 'url', type: 'input', message: 'Database url:' }
    ])

    console.log()
    console.log(options)
    console.log()

    if (!(await confirm('Are you sure of your inputs?'))) {
      process.exit(0)
    }
  }

  return (options as unknown) as Tenant
}

export default { confirm, tenantConf, managementConf }
