import request from 'umi-request'


export const getCredentialApi = (params) => {
  return request('/api/pipeline/credential/list', {
    method: 'get',
    params
  })
}

export const addApi = (data) => {
  return request('/api/pipeline/runner/', {
    method: 'post',
    data
  })
}

export const editApi = (data, id) => {
  return request(`/api/pipeline/runner/${id}/`, {
    method: 'put',
    data
  })
}

export const stopApi = (data, id) => {
  return request(`/api/pipeline/runner/${id}/runner_stop/`, {
    method: 'post',
    data
  })
}

export const vaildCredentialApi = (params, id) => {
  return request(`/api/pipeline/credential/access`, {
    method: 'get',
    params
  })
}


export async function findUser(params, options) {
  return request('/api/devices/info/find_user', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}