import { getDatamodel } from '@prisma/photon/dist/utils/getDatamodel'
import { LiftEngine } from '@prisma/lift'
import path from 'path'

import { Tenant } from '../../shared/types'
import { run, errors } from '../../shared'

class Management {
  photon: any

  async connect() {
    if (this.photon) {
      throw new Error('Already connected')
    }

    const isVerbose = process.env.verbose == 'true'

    const [baseDS, managementDS] = await this.getDatasources()

    // Make sure Photon of tenant is generated
    // This won't be needed once we have default on env() in schema.prisma
    await this.requireGenerated('photon', baseDS)

    // Load Photon of management
    const PhotonManagement = await this.requireGenerated(
      'photon-multi-tenant',
      managementDS,
      __dirname
    )

    let photonManagement

    // Check if the management DB is correctly set up
    try {
      photonManagement = new PhotonManagement({
        debug: isVerbose,
        autoConnect: false
      })
      await photonManagement.connect()

      // Lift up potential new migrations
      if (isVerbose) console.log('  Making sure the management DB is up-to-date...')
      await run('prisma2 lift up', managementDS, __dirname)
      if (isVerbose) console.log('  Ok!')
    } catch (error) {
      if (error.message.includes('data source must point to an existing file.')) {
        // No DB set up. Lift one up and retry
        console.log('  No management DB was found. Building a new one right now...')
        await run('prisma2 lift up', managementDS, __dirname)
        console.log('  Ok!')

        photonManagement = new PhotonManagement({
          debug: isVerbose,
          autoConnect: false
        })
        await photonManagement.connect()
      } else {
        throw error
      }
    }

    this.photon = photonManagement
  }

  disconnect() {
    return this.photon.disconnect()
  }

  async get(name: string): Promise<Tenant> {
    return this.photon.tenants.findOne({ where: { name } }).catch(() => {})
  }

  async getAll(): Promise<Tenant[]> {
    return await this.photon.tenants.findMany()
  }

  async exists(name: string) {
    const tenant = await this.get(name)
    return !!tenant
  }

  async getDatasources() {
    let datamodel = await getDatamodel(process.cwd() + '/prisma')

    datamodel = datamodel.replace(/env\("(.*)"\)/g, (_, env) => {
      if (env == 'PMT_PROVIDER') return '"sqlite"'
      if (env == 'PMT_URL') return '"PMT-URL-PLACEHOLDER"'
      return ''
    })

    const liftEngine = new LiftEngine({
      projectDir: process.cwd()
    })
    const config = await liftEngine.getConfig({ datamodel })

    let datasources = config.datasources

    if (
      !datasources.find(ds => ds.name == 'management') ||
      datasources[0].name == 'management' ||
      datasources[0].url != 'PMT-URL-PLACEHOLDER'
    ) {
      errors.misconfiguredDatasources()
    }

    datasources = datasources.map(datasource => {
      if (datasource.connectorType === 'sqlite' && datasource.name === 'management') {
        let filePath = datasource.url

        if (filePath.startsWith('file:')) {
          filePath = filePath.slice(5)
        }

        return { ...datasource, url: 'file:' + path.resolve(process.cwd(), 'prisma/' + filePath) }
      }
      return datasource
    })

    return datasources
  }

  async requireGenerated(name: string, conf: Tenant, cwd?: string) {
    let Generated = null
    try {
      Generated = require(require.resolve(`@generated/${name}`, {
        paths: [process.cwd()]
      }))
    } catch (e) {
      // Generate and retry
      console.log(`  Generating @generated/${name}...`)
      await run('prisma2 generate', conf, cwd)
      console.log('  Ok!')
      Generated = require(require.resolve(`@generated/${name}`, {
        paths: [process.cwd()]
      }))
    }

    return Generated
  }
}

export default Management
