export interface Tenant {
  name: string
  provider?: string
  connectorType?: string
  url: string
}

export interface Command {
  name: string
  args: Argument[]
  options?: Argument[]
  description: string

  useManagement: boolean

  execute(args: string[]): Promise<void>
}

export interface Argument {
  name: string
  optional?: boolean
  secondary?: boolean
  description: string
}

export interface PhotonTenants {
  [name: string]: PhotonTenant
}

export interface PhotonTenant extends Object {
  disconnect: Function
  _meta?: {
    name: string
  }
}
