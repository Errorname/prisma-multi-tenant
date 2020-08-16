import db, { ProjectUpdateArgs } from "db"

type UpdateProjectInput = {
  where: ProjectUpdateArgs["where"]
  data: ProjectUpdateArgs["data"]
}

export default async function updateProject(
  { where, data }: UpdateProjectInput,
  ctx: Record<any, any> = {}
) {
  // Don't allow updating
  delete data.id

  const project = await db.project.update({ where, data })

  return project
}
