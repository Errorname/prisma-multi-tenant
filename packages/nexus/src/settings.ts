import { Settings } from 'nexus-plugin-prisma/dist/framework/settings'

export interface MultiTenantSettings extends Settings {
  tenantRouter: (req: Express.Request) => string | Promise<string>
}
