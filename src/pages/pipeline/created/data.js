import { message } from 'antd'
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


export const handleCopyPipeline = () => {
  message.info('仅演示流水线增删改查和执行，其他暂不支持')
  return
}