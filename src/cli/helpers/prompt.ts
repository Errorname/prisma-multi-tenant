import inquirer, { Question } from 'inquirer'
import chalk from 'chalk'

import { CommandArguments, Datasource, Tenant } from '../../shared/types'
import { datasourceProviders } from '../../shared/constants'

const confirm = async (message: string) => {
  const { confirm } = await inquirer.prompt([
    {
      name: 'confirm',
      type: 'confirm',
      message,
      default: false
    }
  ])
  return confirm
}

const askQuestion = async (
  question: Question & { name: string; choices?: string[]; value: string }
) => {
  if (question.value) {
    if (!question.choices || (question.choices && question.choices.includes(question.value))) {
      console.log(chalk`  {bold ${question.message}} {blueBright ${question.value}}`)
      return question.value
    }
  }

  return (await inquirer.prompt([question]))[question.name]
}

const askQuestions = async (
  questions: (Question & { name: string; choices?: string[]; value: string })[]
) => {
  const answers: { [name: string]: string } = {}

  for (let question of questions) {
    answers[question.name] = await askQuestion(question)
  }

  // If we needed manual prompting, ask for confirmation
  if (questions.filter(q => !q.value).length > 0) {
    console.log()
    console.log(answers)
    console.log()

    if (!(await confirm('Are you sure of your inputs?'))) {
      process.exit(0)
    }
  }

  return (answers as unknown) as Datasource
}

const askQuestionsList = ({ options }: CommandArguments, questionNames: string[]) => {
  const questions = questionNames.map(name => ({
    // @ts-ignore
    ...questionTemplates[name],
    value: options[name]
  }))

  return askQuestions(questions)
}

const questionTemplates = {
  name: {
    name: 'name',
    message: 'Name of the tenant:',
    type: 'input'
  },
  provider: {
    name: 'provider',
    message: 'Database provider:',
    type: 'list',
    choices: datasourceProviders
  },
  url: {
    name: 'url',
    message: 'Database url:',
    type: 'input'
  }
}

const managementConf = async (args: CommandArguments): Promise<Datasource> => {
  return askQuestionsList(args, ['provider', 'url'])
}

const tenantConf = async (args: CommandArguments): Promise<Tenant> => {
  // This is a fix until we can have a multi-provider prisma client (See #8)

  console.log(
    chalk`  {yellow {bold Warning:} Prisma does not yet allow for multi-provider clients, so you must use the same provider used in your schema.prisma file.}\n`
  )

  const answers = await askQuestionsList(args, ['name', 'provider', 'url'])

  return answers as Tenant
}

export default { confirm, managementConf, tenantConf }
