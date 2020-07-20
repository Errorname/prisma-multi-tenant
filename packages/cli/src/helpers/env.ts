import path from 'path'

import { envPaths } from '@prisma-multi-tenant/shared'

export const loadEnv = () => {
  try {
    require('dotenv').config()

    for (let envPath of envPaths) {
      require('dotenv').config({
        path: path.resolve(process.cwd(), envPath),
      })
    }
  } catch {}
}
