import request from '@/utils/request'


export const getCredentialListApi = (params) => {
  return request('/api/pipeline/credential/list', {
    method: 'get',
    params
  })
}

export const customPathApi = (config) => {
  const { method, path, params, data } = config
  return request(path, {
    method,
    data,
    params
  })
}
