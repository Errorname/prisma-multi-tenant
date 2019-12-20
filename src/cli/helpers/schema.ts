import { getConfig } from '@prisma/sdk'
import { getSchema, getSchemaPath } from '@prisma/cli'

import { writeFile } from './shell'
import { Datasource } from '../../shared/types'
import { CliError } from './errors'

export { getSchemaDir } from '@prisma/cli'

export const readSchema = async () => {
  return getSchema()
}

export const parseSchema = (datamodel: string) => {
  process.env.PMT_URL = 'PMT_TMP_URL'
  return getConfig({ datamodel })
}

export const writeSchema = async (schema: string) => {
  const path = await getSchemaPath()
  if (!path) throw new CliError('no-schema-found')
  return writeFile(path, schema)
}

export const getDatasource = async (type: string) => {
  let rawSchema = await readSchema()

  // Enable all datasources so that Prisma doesn't hide them
  rawSchema = rawSchema.replace(/enabled\s+=\sfalse/g, 'enabled = true')

  const schema = await parseSchema(rawSchema)

  const managementDatasource = schema.datasources.find(d => d.name == type)

  if (!managementDatasource) throw new CliError('no-' + type + '-datasource')

  return managementDatasource
}

export const getManagementDatasource = () => getDatasource('management')

export const getTenantDatasource = () => getDatasource('tenant')

export const translateDatasourceUrl = (url: { value: string }) => {
  if (url.value.startsWith('file:')) {
    return 'file:' + process.cwd() + '/prisma/' + url.value.replace('file:', '')
  }

  return url.value
}

export const prismaSchemaFragment = (
  previous: Datasource,
  management: Datasource
) => `// The two following datasources (tenant and management) are REQUIRED for prisma-multi-tenant

datasource tenant {
  provider = "${previous.provider}"
  url      = env("PMT_URL")
}

datasource management {
  provider = "${management.provider}"
  url      = "${management.url}"
  enabled  = false
}

// End of prisma-multi-tenant

`
