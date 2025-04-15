import request from 'umi-request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const getUserListApi = (params) => {
  return request(`/api/devices/info/find_user`, {
    method: 'get',
    params
  })
}