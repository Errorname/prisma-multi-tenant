import db, { ProjectCreateArgs } from "db"

type CreateProjectInput = {
  data: ProjectCreateArgs["data"]
}
export default async function createProject(
  { data }: CreateProjectInput,
  ctx: Record<any, any> = {}
) {
  const project = await db.project.create({ data })

  return project
}
