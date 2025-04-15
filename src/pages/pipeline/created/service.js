import request from 'umi-request'


export const getListApi = (params) => {
  return request('/api/pipeline/config/list', {
    method: 'get',
    params
  })
}

export const getEntryListApi = (params) => {
  return request('/api/pipeline/mine/shortcut/?ordering=-is_global,sort&limit=1000', {
    method: 'get',
    params
  })
}

export const addFavorites = (data) => {
  return request('/api/pipeline/favorites', {
    method: 'post',
    data
  })
}

export const removeFavorites = (data) => {
  return request('/api/pipeline/favorites', {
    method: 'delete',
    data
  })
}

export const removeEntryApi = (id, data) => {
  return request(`/api/pipeline/mine/shortcut/${id}/`, {
    method: 'delete',
    data
  })
}

export const sortEntryApi = (data) => {
  return request(`/api/pipeline/mine/shortcut/multiple_update/`, {
    method: 'put',
    data
  })
}

export const addEntryApi = (data) => {
  return request(`/api/pipeline/mine/shortcut/`, {
    method: 'post',
    data
  })
}

// 流水线配置是否可编辑
export const canEditApi = (params) => {
  return request('/api/pipeline/conf/can_edit', {
    method: 'get',
    params
  })
}

export const copyPipelineApi = (uuid, version) => {
  return request(`/api/pipeline/config/${uuid}/json/${version}`, {
    method: 'get',
  })
}

export const addPipelineApi = (data) => {
  return request('/api/pipeline/config/add', {
    method: 'post',
    data
  })
}

export const removeApi = (uuid) => {
  return request(`/api/pipeline/config/${uuid}/delete`, {
    method: 'post',
  })
}