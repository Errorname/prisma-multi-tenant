import path from 'path'
import fs from 'fs'

import { PmtError } from './errors'
import { fileExists } from './shell'

export const translateDatasourceUrl = async (url: string): Promise<string> => {
  if (url.startsWith('file:') && !url.startsWith('file:/')) {
    const schemaPath = await getSchemaPath()
    return 'file:' + path.join(process.cwd(), path.dirname(schemaPath), url.replace('file:', ''))
  }

  return url
}

export const getManagementEnv = async (): Promise<{ [name: string]: string }> => {
  if (!process.env.MANAGEMENT_URL) {
    throw new PmtError('missing-env', { name: 'MANAGEMENT_URL' })
  }

  const managementUrl = await translateDatasourceUrl(process.env.MANAGEMENT_URL)

  return {
    PMT_MANAGEMENT_URL: managementUrl,
    PMT_OUTPUT: 'PMT_TMP',
  }
}

export const setManagementEnv = async (): Promise<void> => {
  const managementEnv = await getManagementEnv()

  Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value))
}

export const getEnvPath = async (): Promise<string> => {
  const paths = ['prisma/.env', 'db/.env', '.env']

  for (const envPath of paths) {
    if (await fileExists(envPath)) {
      return envPath
    }
  }

  throw new Error("Couldn't find the prisma/.env file")
}

export const readEnvFile = async (): Promise<string> => {
  const path = await getEnvPath()
  return fs.promises.readFile(path, 'utf-8')
}

export const writeEnvFile = async (content: string): Promise<void> => {
  const path = await getEnvPath()
  return fs.promises.writeFile(path, content)
}

export const getSchemaPath = async (): Promise<string> => {
  const paths = ['prisma/schema.prisma', 'db/schema.prisma', 'schema.prisma']

  for (const schemaPath of paths) {
    if (await fileExists(schemaPath)) {
      return schemaPath
    }
  }

  throw new Error("Couldn't find the prisma/.env file")
}

export const readSchemaFile = async (): Promise<string> => {
  const path = await getSchemaPath()
  return fs.promises.readFile(path, 'utf-8')
}

export const writeSchemaFile = async (content: string): Promise<void> => {
  const path = await getSchemaPath()
  return fs.promises.writeFile(path, content)
}
