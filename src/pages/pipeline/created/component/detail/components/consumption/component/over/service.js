import request from '@/utils/request'


export const getDataApi = (params) => {
  return request(`/api/pipeline/statistics/quality_access/atom_run_times`, {
    method: 'get',
    params
  })
}

export const getWeekApi = (params) => {
  return request('/api/reports/week_list', {
    method: 'get',
    params
  })
}