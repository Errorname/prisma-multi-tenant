import path from 'path'
import fs from 'fs'

import { PmtError } from './errors'
import { fileExists } from './shell'

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
    PMT_OUTPUT: 'PMT_TMP',
  }
}

export const setManagementEnv = async (): Promise<void> => {
  const managementEnv = await getManagementEnv()

  Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value))
}

export const getEnvPath = async (): Promise<string> => {
  const envPath = path.join(process.cwd(), 'prisma', '.env')

  if (!(await fileExists(envPath))) {
    throw new Error("Couldn't find the prisma/.env file")
  }

  return envPath
}

export const readEnvFile = async (): Promise<string> => {
  const path = await getEnvPath()
  return fs.promises.readFile(path, 'utf-8')
}

export const writeEnvFile = async (content: string): Promise<void> => {
  const path = await getEnvPath()
  return fs.promises.writeFile(path, content)
}
