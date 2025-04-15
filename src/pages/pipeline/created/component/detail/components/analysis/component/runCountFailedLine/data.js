export const getType = (type) => {
  switch (type) {
    case 'all':
      return '平均耗时（分钟）'
    case 'success':
      return '运行成功平均耗时（分钟）'
    case 'failed':
      return '运行失败平均耗时（分钟）'
  }
}