import defaultOptions from './defaultOptions'

describe('defaultOptions', () => {
  it('instanciate should return empty object', () => {
    const instanciated = defaultOptions.instanciate('default', 'default')

    expect(instanciated).toEqual({})
  })

  it('nameStageFromReq should extract name/stage from "prisma-service" header', () => {
    const req = { headers: { 'prisma-service': 'default/prod' } }

    const [name, stage] = defaultOptions.nameStageFromReq(req)

    expect(name).toEqual('default')
    expect(stage).toEqual('prod')
  })
})
