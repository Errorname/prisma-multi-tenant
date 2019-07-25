export interface PhotonTenants {
  [name: string]: PhotonTenant
}

export interface PhotonTenant extends Object {
  disconnect: Function
  _meta?: {
    name: string
  }
}
