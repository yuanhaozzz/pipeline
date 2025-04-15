import request from 'umi-request'


export const getListApi = (id, params) => {
  return request(`/api/pipeline/schedule_task/${id}/history`, {
    method: 'get',
    params
  })
}