import request from '@/utils/request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const getDataApi = (uuid, version) => {
  return request(`/api/pipeline/config/${uuid}/json/${version}`, {
    // return request(`/api/pipeline/pipeline_run_info/7411/detail`, {
    method: 'get',
  })
}