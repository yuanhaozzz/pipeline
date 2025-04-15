import request from 'umi-request'


export const getRecordListApi = (params) => {
  return request('/api/pipeline/build_service/builds', {
    method: 'get',
    params
  })
}

export const retryFailedApi = (id) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/retry`, {
    method: 'post',
  })
}


export const cancelAllJobApi = (id) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/cancel`, {
    method: 'post',
  })
}

export const getBuildPageDataApi = () => {
  return request(`/api/viewscount/build_package`, {
    method: 'get',
  })
}

export const getScheduleDetail = (params) => {
  return request(`/api/pipeline/build_service/schedule/${params.id}/`, {
    method: 'get',
    params
  })
}

export const getScheduleOptions = (params) => {
  return request(`/api/pipeline/build_service/schedule/${params.id}/options/`, {
    method: 'get',
    params
  })
}

export const getTimedRecordListApi = (params) => {
  return request('/api/pipeline/build_service/schedule/', {
    method: 'get',
    params
  })
}

// 创建定时任务
export const createSchedule = (id, data) => {
  return request(`/api/pipeline/build_service/schedule/`, {
    method: 'post',
    data,
    params: { pipeline_uuid: id }
  })
}

// 编辑定时任务
export const editSchedule = (params, data) => {
  return request(`/api/pipeline/build_service/schedule/${params.id}/`, {
    method: 'put',
    params: { pipeline_uuid: params.pipeline_uuid },
    data,
  })
}

export const triggerVariablesApi = (id) => {
  return request(`/api/pipeline/${id}/trigger_variables`, {
    method: 'get',
  })
}