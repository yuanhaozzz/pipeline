import request from '@/utils/request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const getRepoPieList = (id) => {
  return request(`/api/pipeline/statistics/${id}/hook_repo_name`, {
    method: 'get',
  })
}
