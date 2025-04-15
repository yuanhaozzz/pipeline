import request from 'umi-request'



export const searchBranch = (params) => {
  return request('/api/pipeline/variables/branch', {
    method: 'get',
    params
  })
}

export const searchRefId = (params) => {
  return request('/api/pipeline/variables/gerrit_ref', {
    method: 'get',
    params
  })
}