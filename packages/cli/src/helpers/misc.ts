import { fileExists } from '@prisma-multi-tenant/shared'

export const useYarn = (): Promise<boolean> => {
  return fileExists(process.cwd() + '/yarn.lock')
}
