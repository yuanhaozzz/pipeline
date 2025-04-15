import request from 'umi-request'


export const getBuildOptionsApi = (params) => {
  return request('/api/pipeline/build_service/options', {
    method: 'get',
    params
  })
}

export const getCopyTaskApi = (id) => {
  return request(`/api/pipeline/${id}/trigger_options`, {
    method: 'get',
  })
}