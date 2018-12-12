import { MultiTenantOptions } from './types'

const defaultOptions: MultiTenantOptions = {
  instanciate: () => ({}),
  nameStageFromReq: (req: any) => req.headers['prisma-service'].split('/')
}

export default defaultOptions
