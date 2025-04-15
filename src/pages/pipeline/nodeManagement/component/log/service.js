import request from 'umi-request'


export const getLogApi = (id) => {
  return request(`/api/pipeline/runner/${id}/runner_log/`, {
    method: 'get',
  })
}