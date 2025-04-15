import request from 'umi-request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const getLatestBuildApi = (id) => {
  return request(`/api/pipeline/build_service/builds/${id}`, {
    method: 'get',
  })
}