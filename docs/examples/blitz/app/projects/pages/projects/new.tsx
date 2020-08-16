import React from "react"
import { Head, Link, useRouter, BlitzPage } from "blitz"
import createProject from "app/projects/mutations/createProject"
import ProjectForm from "app/projects/components/ProjectForm"

const NewProjectPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div>
      <Head>
        <title>New Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Create New Project </h1>

        <ProjectForm
          initialValues={{}}
          onSubmit={async () => {
            try {
              const project = await createProject({ data: { name: "MyName" } })
              alert("Success!" + JSON.stringify(project))
              router.push("/projects/[projectId]", `/projects/${project.id}`)
            } catch (error) {
              alert("Error creating project " + JSON.stringify(error, null, 2))
            }
          }}
        />

        <p>
          {
            <Link href="/projects">
              <a>Projects</a>
            </Link>
          }
        </p>
      </main>
    </div>
  )
}

export default NewProjectPage
