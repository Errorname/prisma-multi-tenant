/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getSchema, getSchemaPath } from '@prisma/cli'

import { writeFile, readFile } from './shell'
import { PmtError } from './errors'
import { Datasource } from './types'
import { datasourceProviders } from './constants'

export const readSchema = async () => {
  try {
    return await getSchema()
  } catch (e) {
    console.error("Couldn't find schema.prisma using @prisma/cli, trying in @prisma/client...")
    return readFile(__dirname + '/../../../@prisma/client/schema.prisma')
  }
}

export const parseSchema = (
  datamodel: string
): {
  datasources: { name: string; connectorType: string; url: { value: string } }[]
} => {
  const datasources = datamodel.match(/datasource\s+\w+\s+{[^}]*}/gm) || []

  return {
    datasources: datasources.map(ds => {
      const nameMatch = ds.match(/datasource\s+([^\s]*)\s+{/)
      const connectorTypeMatch = ds.match(/provider\s+=\s+(.*)/)
      const urlMatch = ds.match(/url\s+=\s+(.*)/)

      if (!nameMatch || !connectorTypeMatch || !urlMatch) {
        throw new Error('invalid schema')
      }

      const connectorType = connectorTypeMatch[1].slice(1, -1)
      const url = urlMatch[1].startsWith('env(')
        ? process.env[urlMatch[1].slice(5, -2)] || 'undefined'
        : urlMatch[1].slice(1, -1)

      return {
        name: nameMatch[1],
        connectorType,
        url: {
          value: url
        }
      }
    })
  }
}

export const writeSchema = async (schema: string) => {
  const path = await getSchemaPath()
  if (!path) throw new PmtError('no-schema-found')
  return writeFile(path, schema)
}

export const getDatasource = async (type: string) => {
  let rawSchema = await readSchema()

  // Enable all datasources so that Prisma doesn't hide them
  rawSchema = rawSchema.replace(/enabled\s+=\sfalse/g, 'enabled = true')

  const schema = await parseSchema(rawSchema)

  const datasource = schema.datasources.find(d => d.name == type)

  if (!datasource) throw new PmtError('no-' + type + '-datasource')

  return datasource
}

export const getManagementDatasource = () => getDatasource('management')

export const getTenantDatasource = () => getDatasource('tenant')

export const translateDatasourceUrl = (url: { value: string }) => {
  if (url.value.startsWith('file:') && !url.value.startsWith('file:/')) {
    return 'file:' + process.cwd() + '/prisma/' + url.value.replace('file:', '')
  }

  return url.value
}

export const getManagementEnv = async () => {
  const managementDatasource = await getManagementDatasource()

  const providersEnv = datasourceProviders.reduce((acc: { [name: string]: string }, provider) => {
    acc['PMT_MANAGEMENT_PROVIDER_' + provider.toUpperCase()] =
      managementDatasource.connectorType == provider ? 'true' : 'false'
    return acc
  }, {})

  return {
    ...providersEnv,
    PMT_MANAGEMENT_URL: translateDatasourceUrl(managementDatasource.url),
    PMT_OUTPUT: 'PMT_TMP'
  }
}

export const setManagementEnv = async () => {
  const managementEnv = await getManagementEnv()

  Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value))
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
