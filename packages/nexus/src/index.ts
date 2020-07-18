import { PluginEntrypoint } from 'nexus/plugin'

import { MultiTenantSettings } from './settings'

const prismaMultiTenant: PluginEntrypoint<MultiTenantSettings> = (settings) => ({
  settings,
  packageJsonPath: require.resolve('../package.json'),
  runtime: {
    module: require.resolve('./runtime'),
    export: 'plugin',
  },
  worktime: {
    module: require.resolve('./worktime'),
    export: 'plugin',
  },
  testtime: {
    module: require.resolve('./testtime'),
    export: 'plugin',
  },
})

export default prismaMultiTenant
export { prismaMultiTenant }

export { multiTenant } from './multiTenant'
