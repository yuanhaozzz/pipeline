import request from '@/utils/request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const getRepoPieList = (id) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/case_statistics`, {
    method: 'get',
  })
}
