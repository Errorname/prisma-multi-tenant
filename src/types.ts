export interface MultiTenantOptions {
  instanciate: (name: string, stage: string) => PrismaInstance
  nameStageFromReq: (req: Request) => [string, string]
}

export interface PrismaInstances {
  [name: string]: {
    [stage: string]: PrismaInstance
  }
}

export interface PrismaInstance {
  _meta?: {
    service: {
      name: string
      stage: string
    }
  }
}
