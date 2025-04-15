


function setCount(count, type) {
  const list = []
  for (let i = 0; i < count; i++) {
    const v = i < 10 ? '0' + i : i
    switch (type) {
      case 'minute':
        if (i % 10 === 0) {
          list.push({ value: i, label: v })
        }
        break
      default:
        list.push({ value: i, label: v })
    }

  }
  return list
}
export const day = setCount(11)

export const hour = setCount(24)

export const minute = setCount(60, 'minute')

export const dateOptions = [
  // {
  //   value: 1,
  //   label: '1分钟',
  // },
  {
    value: 30,
    label: '30分钟',
  },
  {
    value: 60,
    label: '1小时',
  },
  {
    value: 120,
    label: '2小时',
  },
  {
    value: 300,
    label: '5小时',
  },
  {
    value: 600,
    label: '10小时',
  },
]

export const weekData = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
]