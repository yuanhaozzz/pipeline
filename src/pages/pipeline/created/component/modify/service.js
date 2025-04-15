import request from 'umi-request'


export const editApi = (id, data) => {
  return request(`/api/pipeline/config/${id}`, {
    method: 'post',
    data
  })
}

export const updateApi = (id, data) => {
  return request(`/api/pipeline/config/${id}/update`, {
    method: 'post',
    data
  })
}

export const searchPipelineApi = (id) => {
  return request(`/api/pipeline/config/${id}`, {
    method: 'get',
  })
}

// 编辑锁定
export const lockEditApi = (data) => {
  return request('/api/pipeline/conf/can_edit', {
    method: 'post',
    data
  })
}

// 释放编辑锁定
export const releaseCanEditApi = (params) => {
  return request('/api/pipeline/conf/can_edit', {
    method: 'delete',
    params
  })
}

// 释放编辑锁定
export const setTriggerListAPi = (id, data) => {
  return request(`/api/pipeline/config/${id}/trigger_config`, {
    method: 'post',
    data
  })
}
