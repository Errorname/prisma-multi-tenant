import { Command } from '../../shared/types'

import chalk from 'chalk'
import Table from 'cli-table3'

import management from '../management'

class List implements Command {
  name = 'generate'
  args = []
  description = 'Generate Photon for the tenants and management'

  useManagement = false

  async execute() {
    const [baseDS, managementDS] = await management.getDatasources()

    await management.requireGenerated('photon', baseDS)

    await management.requireGenerated(
      'photon-multi-tenant',
      managementDS,
      __dirname + '/../../lib/management'
    )
  }
}

export default new List()
