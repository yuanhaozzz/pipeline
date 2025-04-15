import request from 'umi-request'

export const getJobLog = (triggerId, jobId, params = { line: 1000 }) => {
  return request(`/api/pipeline/job_run_info/${jobId}/latest_log`, {
    method: 'get',
    params
  })
}

export const getTaskLog = (triggerId, taskId, params = { line: 1000 }) => {
  return request(`/api/pipeline/task_run_info/${taskId}/latest_log`, {
    method: 'get',
    params
  })
}