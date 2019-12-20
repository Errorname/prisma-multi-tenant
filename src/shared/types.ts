export interface Command {
  name: string
  args: Argument[]
  options?: Argument[]
  description: string

  execute(args: CommandArguments): Promise<void>
}

export interface Argument {
  name: string
  optional?: boolean
  secondary?: boolean
  description: string
  boolean?: boolean
}

export interface CliArguments {
  argv: string[]
  primaryArgs: string[]
  secondaryArgs: string[]
  parsedPrimaryArgs: {
    _: string[]
    ['--help']?: boolean
    ['--version']?: boolean
    ['--verbose']?: boolean
  }
  commandName: string
}

export interface CommandArguments {
  args: string[]
  options: {
    [name: string]: string
  }
  secondary: string
}

export interface Datasource {
  name?: string
  provider: string
  url: string
}

export interface Tenant extends Datasource {
  id: string
  name: string
}
