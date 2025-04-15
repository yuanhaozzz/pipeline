import request from 'umi-request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const getCompilePluginsApi = (id) => {
  return request('/api/pipeline/atom/' + id, {
    method: 'get',
  })
}