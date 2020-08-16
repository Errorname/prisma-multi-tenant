import db, { ProjectDeleteArgs } from "db"

type DeleteProjectInput = {
  where: ProjectDeleteArgs["where"]
}

export default async function deleteProject(
  { where }: DeleteProjectInput,
  ctx: Record<any, any> = {}
) {
  const project = await db.project.delete({ where })

  return project
}
