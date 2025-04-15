import request from '@/utils/request'


export const getListApi = (params, uuid) => {
  return request(`/api/pipeline/statistics/${uuid}/runiid_and_created_at`, {
    method: 'get',
    params
  })
}