#!/usr/bin/env node

import chalk from 'chalk'

import { Command } from '../types'
import * as commands from '../commands'

const packageJson = require('../../../package.json')

const printGlobalHelp = () => {
  console.log(chalk`
  {bold.cyan 🧭  prisma-multi-tenant} {grey v${packageJson.version}}
  
  {bold USAGE}

    {bold.italic prisma-multi-tenant} [command] [args]
    
    {grey Examples:}
        {grey prisma-multi-tenant new}
        {grey prisma-multi-tenant lift up}
        {grey ...}

  {bold COMMANDS}
    
${Object.values(commands)
  .map((command: Command) => {
    const args = command.args
      .filter(arg => !arg.secondary)
      .map(arg => `<${arg.name + (arg.optional ? '?' : '')}>`)
      .join(' ')
    const strLength = command.name.length + args.length
    const spaceBetween = ''.padStart(23 - strLength)

    return chalk`    {bold ${command.name}} ${args} ${spaceBetween} ${command.description}`
  })
  .join('\n')}

  {bold OPTIONS}

    {bold -h, --help}                Output usage information for a command
    {bold -V, --version}             Output the version number
    {bold --verbose}                 Print additional logs
  `)
  process.exit(0)
}

const printCommandHelp = (command: Command) => {
  console.log(chalk`
  {bold.cyan 🧭  prisma-multi-tenant} {bold.yellow ${command.name}}

    ${command.description}

  {bold USAGE}

    {bold.italic prisma-multi-tenant} ${command.name}${
    command.args.length > 0 ? ' ' : ''
  }${command.args
    .map(
      arg =>
        `${arg.secondary ? '<' : '['}${arg.name + (arg.optional ? '?' : '')}${
          arg.secondary ? '>' : ']'
        }`
    )
    .join(' ')}${
    command.options
      ? ' (' + command.options.map(option => `--${option.name}=[${option.name}]`).join(' ') + ')'
      : ''
  }
  `)

  if (command.args.length > 0) {
    console.log(chalk`
  {bold ARGS}

${command.args
  .map(arg => {
    const argStr = arg.name.replace(/\|/g, ', ')
    const strLength = argStr.length
    const spaceBetween = ''.padStart(13 - strLength)

    return chalk`    {bold ${argStr}} ${spaceBetween} ${arg.description} ${
      arg.optional ? chalk`{italic.grey (optional)}` : ''
    }`
  })
  .join('\n')}
    `)
  }

  console.log(chalk`
  {bold OPTIONS}
  `)

  if (command.options && command.options.length > 0) {
    console.log(
      command.options
        .map(option => {
          const strLength = option.name.length
          const spaceBetween = ''.padStart(11 - strLength)

          return chalk`    {bold --${option.name}} ${spaceBetween} ${option.description}`
        })
        .join('\n')
    )
  }

  console.log(chalk`
    {bold -h, --help}     Display this help
    {bold --verbose}      Print additional logs
  `)
}

const printGlobalVersion = () => {
  console.log(packageJson.version)
  process.exit(0)
}

export default {
  printGlobalHelp,
  printCommandHelp,
  printGlobalVersion
}
