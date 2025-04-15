function setCount(count, type) {
  const list = []
  for (let i = 0; i < count; i++) {
    list.push({ value: (i + 1) * 30, label: i + 1 + '个月' })
  }
  return list
}

export const dateOptions = setCount(12)
