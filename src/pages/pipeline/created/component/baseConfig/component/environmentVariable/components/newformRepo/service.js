import request from 'umi-request'


export const searchRepo = (params) => {
  return request('/api/pipeline/variables/repo', {
    method: 'get',
    params
  })
}