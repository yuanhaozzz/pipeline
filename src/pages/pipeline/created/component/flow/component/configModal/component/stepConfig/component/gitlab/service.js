import request from 'umi-request'


export const getCredentialListApi = (params) => {
  return request('/api/pipeline/credential/list', {
    method: 'get',
    params
  })
}