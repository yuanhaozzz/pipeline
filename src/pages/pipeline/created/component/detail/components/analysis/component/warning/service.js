import request from '@/utils/request'


export const getDataApi = (params) => {
  return request('/api/pipeline/statistics/compile', {
    method: 'get',
    params
  })
}