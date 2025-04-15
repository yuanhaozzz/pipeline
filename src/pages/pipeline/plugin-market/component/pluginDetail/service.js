import request from 'umi-request'


export const addApi = (data) => {
  return request('/api/pipeline/atom/create', {
    method: 'post',
    data
  })
}

export const saveApi = (data) => {
  return request('/api/pipeline/atom/save', {
    method: 'post',
    data
  })
}

export const publishApi = (atomId, data) => {
  return request('/api/pipeline/atom/save/' + atomId, {
    method: 'post',
    data
  })
}

export const detailApi = (atomId, params) => {
  return request('/api/pipeline/atom/' + atomId, {
    method: 'get',
    params
  })
}