import { Management } from '@prisma-multi-tenant/shared'

export interface Command {
  name: string
  altNames?: string[]
  args: Argument[]
  options?: Argument[]
  description: string

  execute(args: CommandArguments, management: Management): Promise<void>
}

export interface Argument {
  name: string
  altNames?: string[]
  optional?: boolean
  secondary?: boolean
  description: string
  boolean?: boolean
}

export interface CliArguments {
  argv: string[]
  primaryArgs: string[]
  secondaryArgs: string
  parsedPrimaryArgs: {
    _: string[]
    ['--help']?: boolean
    ['--version']?: boolean
    ['--verbose']?: boolean
    ['--env']?: string
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
