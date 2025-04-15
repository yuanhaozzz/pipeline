import request from 'umi-request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const getConfigListApi = (params) => {
  return request('/api/devices/vm_config/list', {
    method: 'get',
    params
  })
}


export const getZoneListApi = (params) => {
  return request('/api/devices/zone/list', {
    method: 'get',
    params
  })
}