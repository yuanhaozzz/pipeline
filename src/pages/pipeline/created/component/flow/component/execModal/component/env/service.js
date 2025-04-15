import request from 'umi-request'


export const getInputVariables = (id, params) => {
  return request(`/api/pipeline/task_run_info/${id}/env_variables`, {
    method: 'get',
    params
  })
}

export const getOutputVariables = (id, params) => {
  return request(`/api/pipeline/task_run_info/${id}/variables`, {
    method: 'get',
    params
  })
}
