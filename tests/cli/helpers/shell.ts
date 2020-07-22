import { exec, spawn, ChildProcess } from 'child_process'
import fs from 'fs'

const playgroundPath = __dirname + '/../../playground/'

export const spawnCommand = (cmd: string, cwd: string = ''): ChildProcess => {
  const [name, ...args] = cmd.split(' ')
  return spawn(name, args, {
    detached: true,
    cwd: playgroundPath + cwd,
    env: {
      ...process.env,
      PATH: __dirname + ':' + process.env.PATH,
    },
  })
}

export const runShell = (cmd: string, cwd: string = ''): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        cwd: playgroundPath + cwd,
        env: {
          ...process.env,
          PMT_TEST: 'true',
        },
      },
      (error, stdout, stderr) => {
        if (error) reject(error)
        resolve(stdout)
      }
    )
  })
}

export const fileExists = (path: string) => {
  return new Promise((resolve) => {
    fs.access(playgroundPath + path, fs.constants.F_OK, (err) => {
      resolve(!err)
    })
  })
}
