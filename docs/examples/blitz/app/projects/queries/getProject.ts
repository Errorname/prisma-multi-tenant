import { FindOneProjectArgs } from "db"

type GetProjectInput = {
  where: FindOneProjectArgs["where"]
  // Only available if a model relationship exists
  // include?: FindOneProjectArgs['include']
}

export default async function getProject(
  { where /* include */ }: GetProjectInput,
  ctx: Record<any, any> = {}
) {
  const project = await ctx.db.project.findOne({ where })

  return project
}
