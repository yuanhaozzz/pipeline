import request from 'umi-request'


export const searchRepo = (params) => {
  return request('/api/pipeline/variables/repo', {
    method: 'get',
    params
  })
}

export const searchBranch = (params) => {
  return request('/api/pipeline/variables/branch', {
    method: 'get',
    params
  })
}

export const searchCommitId = (params) => {
  return request('/api/pipeline/variables/commit', {
    method: 'get',
    params
  })
}