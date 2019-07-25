import { Command } from '../types'

class Export implements Command {
  name = 'export'
  args = [
    {
      name: 'name',
      optional: true,
      description: 'Name of the tenant you want to export from'
    }
  ]
  description = 'Export one or all tenants and management'

  useManagement = true

  async execute() {
    throw new Error('Export is not implemented yet')
  }
}

export default new Export()
