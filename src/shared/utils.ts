export const getProviderFromUrl = (url: string) => {
  if (url.startsWith('file:')) return 'sqlite'
  if (url.startsWith('postgresql:') || url.startsWith('postgres:')) return 'postgresql'
  if (url.startsWith('mysql:')) return 'mysql'
  throw new Error(`Unrecognized provider from url "${url}"`)
}

type EnvObject = { [name: string]: string }
type EnvArray = string[][]

export const setProcessEnv = (...envs: (EnvObject | EnvArray)[]) => {
  for (let env of envs) {
    if (!env.length) {
      env = Object.entries(env)
    }

    ;(env as EnvArray).forEach(([key, value]) => (process.env[key] = value))
  }
}
