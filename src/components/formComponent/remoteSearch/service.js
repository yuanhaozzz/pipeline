
import request from '@/utils/request'


// export const getListApi = (params) => {
//   return request(`/api/devices/info/find_user`, {
//     method: 'get',
//     params
//   })
// }


export const getListApi = (url, params) => {
  return request(`${url}`, {
    method: 'get',
    params
  })
}