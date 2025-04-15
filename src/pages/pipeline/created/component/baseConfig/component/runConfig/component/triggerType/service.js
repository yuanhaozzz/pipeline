import request from 'umi-request'


export const getTriggerListApi = (id, params) => {
  return request(`/api/pipeline/config/${id}/trigger_config`, {
    method: 'get',
    params
  })
}