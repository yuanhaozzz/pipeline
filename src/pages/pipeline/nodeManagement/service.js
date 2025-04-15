import request from 'umi-request'


export const getListApi = (params) => {
  return request('/api/pipeline/runner/tags', {
    method: 'get',
    params
  })
}

export const getListRecordApi = (params) => {
  return request('/api/pipeline/runner/', {
    method: 'get',
    params
  })
}

export const reDeployApi = (params) => {
  return request(`/api/pipeline/runner/${params.id}/re_deploy/`, {
    method: 'post',
  })
}

export const removeApi = (runner_id, data) => {
  return request(`/api/pipeline/runner/${runner_id}/runner_delete/`, {
    method: 'delete',
    data
  })
}

export async function getuserList(value) {
  try {
    let arr = await request('/api/devices/info/find_user', {
      method: 'get',
      params: {
        username: value || ''
      }
    });
    arr = arr.map(item => {
      item.label = item.username;
      item.value = item.user_id;
      return item
    })
    return arr
  } catch (error) {
    console.log(error);
  }
}

