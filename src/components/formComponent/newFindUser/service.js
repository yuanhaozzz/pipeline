import request from '@/utils/request'


export const getUserListApi = (params) => {
  return request(`/api/devices/info/find_user`, {
    method: 'get',
    params
  })
}