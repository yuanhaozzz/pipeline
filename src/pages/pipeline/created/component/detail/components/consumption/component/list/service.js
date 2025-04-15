import request from '@/utils/request'


export const getListApi = (id) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/case`, {
    method: 'get',
  })
}