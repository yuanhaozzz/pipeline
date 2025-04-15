import request from '@/utils/request'


export const getDataApi = (id, params) => {
  return request(`/api/pipeline/statistics/${id}/overall`, {
    method: 'get',
    params
  })
}
