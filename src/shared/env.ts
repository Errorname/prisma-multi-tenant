import { getSchemaPath } from '@prisma/cli'

import { writeFile, readFile } from './shell'
import { PmtError } from './errors'
import { datasourceProviders } from './constants'

export const getEnvPath = async () => {
  let path

  // Try with default path
  path = await getSchemaPath().catch(() => null)

  // Try with relative path
  if (!path) {
    path = await getSchemaPath('../../../../@prisma/schema.prisma').catch(() => null)
  }

  if (!path) {
    throw new Error("Couldn't find the prisma/.env file")
  }

  // Use .env file, not schema.prisma
  path = path.replace('schema.prisma', '.env')

  return path
}

export const readEnvFile = async () => {
  const path = await getEnvPath()
  return readFile(path)
}

export const writeEnvFile = async (content: string) => {
  const path = await getEnvPath()
  return writeFile(path, content)
}

export const translateDatasourceUrl = (url: string) => {
  if (url.startsWith('file:') && !url.startsWith('file:/')) {
    return 'file:' + process.cwd() + '/prisma/' + url.replace('file:', '')
  }

  return url
}

export const getManagementEnv = async () => {
  if (!process.env.MANAGEMENT_PROVIDER) {
    throw new PmtError('missing-env', { name: 'MANAGEMENT_PROVIDER' })
  } else if (!process.env.MANAGEMENT_URL) {
    throw new PmtError('missing-env', { name: 'MANAGEMENT_URL' })
  }

  const managementDatasource = {
    provider: process.env.MANAGEMENT_PROVIDER,
    url: process.env.MANAGEMENT_URL
  }

  const providersEnv = datasourceProviders.reduce((acc: { [name: string]: string }, provider) => {
    acc['PMT_MANAGEMENT_PROVIDER_' + provider.toUpperCase()] =
      managementDatasource.provider == provider ? 'true' : 'false'
    return acc
  }, {})

  return {
    ...providersEnv,
    PMT_MANAGEMENT_URL: translateDatasourceUrl(managementDatasource.url),
    PMT_OUTPUT: 'PMT_TMP'
  }
}

export const setManagementEnv = async () => {
  const managementEnv = await getManagementEnv()

  Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value))
}
