import { RuntimePlugin } from 'nexus/plugin'
import { PrismaClientOptions } from 'nexus-plugin-prisma/dist/framework/settings'
import { plugin as prismaPlugin } from 'nexus-plugin-prisma/dist/framework/runtime'

import { MultiTenantSettings } from './settings'
import { multiTenant } from './multiTenant'

export const plugin: RuntimePlugin<MultiTenantSettings> = (settings) => (project) => {
  if (!settings) throw new Error('No settings available in plugin')

  const { tenantRouter, ...prismaSettings } = settings

  const prismaPluginData = prismaPlugin(prismaSettings)(project)

  if (prismaPluginData.context) {
    prismaPluginData.context.create = async (req) => {
      const name = await tenantRouter(req)
      const tenant = await multiTenant.get(
        name,
        (prismaSettings.client as PrismaClientOptions)?.options || null
      )

      return {
        db: tenant,
      }
    }
  }

  return prismaPluginData
}
