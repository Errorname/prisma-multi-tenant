const getOptions = (args: string[]): { [key: string]: string } =>
  args
    .filter((arg): boolean => arg.startsWith('--'))
    .reduce((acc: any, arg): { [key: string]: string } => {
      const args = arg.match(/--(.*)=(.*)/) as string[]
      if (!args) return acc
      const [, name, value] = args
      acc[name] = value
      return acc
    }, {})

export default { getOptions }
