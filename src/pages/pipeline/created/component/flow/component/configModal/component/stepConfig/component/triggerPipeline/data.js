export const formItemConfig = {
  required: true,
  message: '请选择触发流水线',
  style: {
    width: '100%',
    marginBottom: '5px'
  },
  name: 'selected_pipeline',
  label: '触发流水线（支持流水线名字搜索）',
  initialValue: []
}

export const component = {
  type: 'remoteSearchSelect',
  placeholder: '触发流水线 uuid',
  api: {
    method: 'get',
    path: '/api/pipeline/config/list',
    params: { size: 10, page_num: 1 }
  },
  optionValue: 'uuid',
  optionLabel: 'name',
  searchField: 'name',
}