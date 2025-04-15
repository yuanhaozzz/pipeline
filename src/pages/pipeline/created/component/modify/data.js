export const tabList = [
  {
    id: 2,
    name: '基础设置',
  },
  {
    id: 1,
    name: '流水线',
  },
  {
    id: 3,
    name: '通知',
  },
]

export const stageTemplate = () => {
  return {
    id: 1,
    name: 'stage-1',
    type: 1,
    jobs: [],
    showAddButton: false
  }
}

export const jobTemplate = () => {
  return {
    id: 1,
    name: 'job',
    type: 2,
    tasks: []
  }
}

export const stepTemplate = () => {
  return {
    id: 1,
    name: '请选择插件',
    type: 3,
    plugin: ''
  }
}