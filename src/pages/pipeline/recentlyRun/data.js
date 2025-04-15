

export const addType = (stages) => {
  stages.forEach(stage => {
    stage.type = 1
    stage.jobs.forEach(job => {
      job.type = 2
      job.tasks.forEach(task => {
        task.type = 3
      })
    })
  })
}