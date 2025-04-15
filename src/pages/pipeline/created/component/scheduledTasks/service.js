import request from 'umi-request'


export const getListApi = (params) => {
  return request('/api/pipeline/schedule_task/list', {
    method: 'get',
    params
  })
}

export const removeApi = (id) => {
  return request(`/api/pipeline/schedule_task/${id}`, {
    method: 'delete',
  })
}

export const switchApi = (id, data) => {
  return request(`/api/pipeline/schedule_task/${id}/switch`, {
    method: 'post',
    data
  })
}

export const getPipelineListApi = (params) => {
  return request('/api/pipeline/config/list', {
    method: 'get',
    params
  })
}