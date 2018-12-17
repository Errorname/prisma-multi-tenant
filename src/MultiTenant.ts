import { MultiTenantOptions, PrismaInstances, PrismaInstance } from './types'
import defaultOptions from './defaultOptions'

class MultiTenant {
  options: MultiTenantOptions
  instances: PrismaInstances

  constructor(options: MultiTenantOptions = defaultOptions) {
    this.options = { ...defaultOptions, ...options }
    this.instances = {}
  }

  current(req: Object): PrismaInstance {
    const [name, stage] = this.options.nameStageFromReq(req)

    if (!name || !stage) {
      throw Error('The service name/stage could not be found in the request')
    }

    if (!this.getInstance(name, stage)) this.instanciate(name, stage)

    return <PrismaInstance>this.getInstance(name, stage)
  }

  getInstance(name: string, stage: string): PrismaInstance | null {
    return this.instances[name] ? this.instances[name][stage] : null
  }

  instanciate(name: string, stage: string): PrismaInstance {
    const instance = this.options.instanciate(name, stage)

    instance._meta = {
      service: {
        name,
        stage
      }
    }

    if (!this.instances[name]) this.instances[name] = {}

    this.instances[name][stage] = instance

    return instance
  }
}

export default MultiTenant
