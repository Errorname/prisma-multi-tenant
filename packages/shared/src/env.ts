import path from 'path'
import fs from 'fs'

import { PmtError } from './errors'
import { fileExists } from './shell'

export const translateDatasourceUrl = (url: string, cwd?: string): string => {
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.slice(1, -1)
  }

  if (url.startsWith('file:') && !url.startsWith('file:/')) {
    return 'file:' + path.join(cwd || process.cwd(), url.replace('file:', '')).replace(/\\/g, '/')
  }

  return url
}

export const getManagementEnv = async (): Promise<{ [name: string]: string }> => {
  if (!process.env.MANAGEMENT_URL) {
    throw new PmtError('missing-env', { name: 'MANAGEMENT_URL' })
  }

  const managementUrl = translateDatasourceUrl(process.env.MANAGEMENT_URL)

  return {
    PMT_MANAGEMENT_URL: managementUrl,
    PMT_OUTPUT: 'PMT_TMP',
  }
}

export const setManagementEnv = async (): Promise<void> => {
  const managementEnv = await getManagementEnv()

  Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value))
}

export const envPaths = [
  'prisma/.env',
  'db/.env', // Blitz
  '../.env.defaults', // Redwood
  '.env',
]

export const getEnvPath = async (schemaPath?: string): Promise<string> => {
  if (schemaPath) {
    const envPath = path.join(path.dirname(schemaPath), '.env')
    if (await fileExists(envPath)) {
      return envPath
    }
  }

  for (const envPath of envPaths) {
    if (await fileExists(envPath)) {
      return envPath
    }
  }

  throw new Error("Couldn't find the prisma/.env file")
}

export const readEnvFile = async (schemaPath?: string): Promise<string> => {
  const path = await getEnvPath(schemaPath)
  return fs.promises.readFile(path, 'utf-8')
}

export const writeEnvFile = async (content: string, schemaPath?: string): Promise<void> => {
  let path
  try {
    path = await getEnvPath(schemaPath)
  } catch {
    // Can't get path? Then we force write it to prisma/.env
    path = 'prisma/.env'
  }
  return fs.promises.writeFile(path, content)
}

export const schemaPaths = [
  'prisma/schema.prisma',
  'db/schema.prisma', // Blitz
  'api/prisma/schema.prisma', // Redwood
  'schema.prisma',
]

export const getSchemaPath = async (): Promise<string> => {
  for (const schemaPath of schemaPaths) {
    if (await fileExists(schemaPath)) {
      return schemaPath
    }
  }

  throw new Error("Couldn't find the schema file")
}

export const readSchemaFile = async (schemaPath?: string): Promise<string> => {
  const path = schemaPath || (await getSchemaPath())
  return fs.promises.readFile(path, 'utf-8')
}

export const writeSchemaFile = async (content: string, schemaPath?: string): Promise<void> => {
  const path = schemaPath || (await getSchemaPath())
  return fs.promises.writeFile(path, content, 'utf-8')
}
