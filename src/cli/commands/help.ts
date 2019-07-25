import { Command } from '../types'

class Export implements Command {
  name = 'help'
  args = []
  description = 'Display this help'

  useManagement = false

  async execute() {
    // Do nothing, printing global help is handled by src/cli/index.ts
  }
}

export default new Export()
