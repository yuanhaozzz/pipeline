import request from '@/utils/request'


export const getDataApi = (id, params) => {
  return request(`/api/pipeline/statistics/${id}/pipeline_run_times`, {
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