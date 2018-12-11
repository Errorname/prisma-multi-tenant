const defaultOptions = {
  instanciate: () => null,
  nameStageFromReq: req => req.headers['prisma-service'].split('/')
}

class MultiTenant {
  constructor(options) {
    this.options = Object.assign(defaultOptions, options)
    this.instances = {}
  }

  current(req) {
    const [name, stage] = this.options.nameStageFromReq(req)

    if (!name || !stage) {
      throw Error('The service name/stage could not be found in the request')
    }

    if (!this.getInstance(name, stage)) this.instanciate(name, stage)

    return this.getInstance(name, stage)
  }

  getInstance(name, stage) {
    return this.instances[name] ? this.instances[name][stage] : null
  }

  instanciate(name, stage) {
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

module.exports = MultiTenant
