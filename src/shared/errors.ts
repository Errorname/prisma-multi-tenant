export class CliError extends Error {
  type: string
  data: any[]
  constructor(type: string, ...data: any[]) {
    super(type)
    this.type = type
    this.data = data
  }
}
