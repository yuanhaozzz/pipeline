import request from 'umi-request'



export const searchCommitId = (params) => {
  return request('/api/pipeline/variables/commit', {
    method: 'get',
    params
  })
}