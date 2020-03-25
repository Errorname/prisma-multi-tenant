import path from 'path'
import fs from 'fs'
import { getSchemaPath } from '@prisma/cli'

import { writeFile, readFile, getNodeModules } from './shell'
import { PmtError } from './errors'

export const getEnvPath = async (): Promise<string> => {
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
  const schemaPath = await getSchemaPath(
    path.join(nodeModules, 'prisma-multi-tenant', 'build', 'cli', 'prisma', 'schema.prisma')
  )

  if (!schemaPath) {
    throw new PmtError('management-schema-not-found')
  }

  // 2. Read content of file
  let content: string = await new Promise((res, rej) =>
    fs.readFile(schemaPath, 'utf8', (err, data) => (err ? rej(err) : res(data)))
  )

  // 3. Change provider of datasource
  content = content.replace(
    /datasource\s*management\s*{\s*provider\s*=\s*"([^"]*)"/,
    (match, p1) => {
      return match.replace(p1, process.env.MANAGEMENT_PROVIDER || '')
    }
  )

  // 4. Write content to file
  return new Promise((res, rej) =>
    fs.writeFile(schemaPath, content, err => (err ? rej(err) : res()))
  )
}
