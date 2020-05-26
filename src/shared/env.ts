import path from 'path'

import { writeFile, readFile, getNodeModules, fileExists } from './shell'
import { PmtError } from './errors'

export const getEnvPath = async (): Promise<string> => {
  const envPath = path.join(process.cwd(), 'prisma', '.env')

  if (!(await fileExists(envPath))) {
    throw new Error("Couldn't find the prisma/.env file")
  }

  return envPath
}

export const readEnvFile = async (): Promise<string> => {
  const path = await getEnvPath()
  return readFile(path)
}

export const writeEnvFile = async (content: string): Promise<void> => {
  const path = await getEnvPath()
  return writeFile(path, content)
}

export const translateDatasourceUrl = (url: string): string => {
  if (url.startsWith('file:') && !url.startsWith('file:/')) {
    return 'file:' + process.cwd() + '/prisma/' + url.replace('file:', '')
  }

  return url
}

export const getManagementEnv = async (): Promise<{ [name: string]: string }> => {
  if (!process.env.MANAGEMENT_URL) {
    throw new PmtError('missing-env', { name: 'MANAGEMENT_URL' })
  }

  return {
    PMT_MANAGEMENT_URL: translateDatasourceUrl(process.env.MANAGEMENT_URL),
    PMT_OUTPUT: 'PMT_TMP'
  }
}

export const setManagementEnv = async (): Promise<void> => {
  const managementEnv = await getManagementEnv()

  Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value))
}

export const setManagementProviderInSchema = async (): Promise<void> => {
  if (!process.env.MANAGEMENT_PROVIDER) {
    throw new PmtError('missing-env', { name: 'MANAGEMENT_PROVIDER' })
  }

  const nodeModules = getNodeModules()

  // 1. Find schema file
  const schemaPath = path.join(nodeModules, 'prisma-multi-tenant/build/cli/prisma/schema.prisma')

  if (!(await fileExists(schemaPath))) {
    throw new PmtError('management-schema-not-found')
  }

  // 2. Read content of file
  let content = await readFile(schemaPath)

  // 3. Change provider of datasource
  content = content.replace(
    /datasource\s*management\s*{\s*provider\s*=\s*"([^"]*)"/,
    (match, p1) => {
      return match.replace(p1, process.env.MANAGEMENT_PROVIDER || '')
    }
  )

  // 4. Write content to file
  return writeFile(schemaPath, content)
}

export const setManagementProviderInMigration = async (): Promise<void> => {
  if (!process.env.MANAGEMENT_PROVIDER) {
    throw new PmtError('missing-env', { name: 'MANAGEMENT_PROVIDER' })
  }

  const nodeModules = getNodeModules()

  // 1. Find migration steps file
  const stepsPath = path.join(
    nodeModules,
    'prisma-multi-tenant/build/cli/prisma/migrations/20200526145455-beta/steps.json'
  )

  if (!(await fileExists(stepsPath))) {
    throw new PmtError('management-migration-not-found')
  }

  // 2. Read content of file
  const content = JSON.parse(await readFile(stepsPath))

  // 3. Change provider of datasource
  content.steps.find(
    (step: any) => step.argument == 'provider'
  ).value = `\"${process.env.MANAGEMENT_PROVIDER}\"`

  // 4. Write content to file
  return writeFile(stepsPath, JSON.stringify(content, null, 2))
}
