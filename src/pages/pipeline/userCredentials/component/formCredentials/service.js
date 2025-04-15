import request from 'umi-request'


export const addApi = (data) => {
  return request('/api/pipeline/credential/create', {
    method: 'post',
    data
  })
}

export const editApi = (data, id) => {
  return request(`/api/pipeline/credential/${id}/edit`, {
    method: 'post',
    data
  })
}

export const getDetailApi = (id) => {
  return request(`/api/pipeline/credential/${id}`, {
    method: 'get',
  })
}