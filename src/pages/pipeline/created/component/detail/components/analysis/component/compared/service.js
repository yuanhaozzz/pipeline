import request from '@/utils/request'


export const getDataApi = (params, uuid) => {
  return request(`/api/pipeline/statistics/${uuid}/all_run_duration_details`, {
    method: 'get',
    params
  })
}