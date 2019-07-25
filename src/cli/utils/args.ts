const getOptions = (args: string[]) =>
  args
    .filter(arg => arg.startsWith('--'))
    .reduce((acc: any, arg) => {
      const [_, name, value] = <string[]>arg.match(/--(.*)=(.*)/)
      acc[name] = value
      return acc
    }, {})

export default { getOptions }
