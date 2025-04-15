import request from 'umi-request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}


export const searchPipelineApi = (id, params) => {
  return request(`/api/pipeline/config/${id}`, {
    method: 'get',
    params
  })
}

export const addApi = (id, data) => {
  return request(`/api/pipeline/${id}/schedule_task`, {
    method: 'post',
    data
  })
}

export const editApi = (id, data) => {
  return request(`/api/pipeline/schedule_task/${id}`, {
    method: 'put',
    data
  })
}

export const detailApi = (id) => {
  return request(`/api/pipeline/schedule_task/${id}`, {
    method: 'get',
  })
}