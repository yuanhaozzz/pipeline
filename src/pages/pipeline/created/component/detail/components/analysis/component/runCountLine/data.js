export const getType = (type) => {
  switch (type) {
    case 'all':
      return '总次数'
    case 'success':
      return '成功次数'
    case 'failed':
      return '失败次数'
    case 'success_rate':
      return '成功率'
  }
}

export const getTypeColor = (option) => {
  switch (option) {
    case 'failed':
      return '#f55452'
    case 'success':
      return '#4dcb4f'
    case 'all':
      return '#407dff'
    case 'success_rate':
      return '#7bc9ee'
  }
}