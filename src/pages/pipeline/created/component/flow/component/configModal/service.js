import request from 'umi-request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const getVariablesApi = (params) => {
  return request('/api/pipeline/atom/variables', {
    method: 'get',
    params
  })
}