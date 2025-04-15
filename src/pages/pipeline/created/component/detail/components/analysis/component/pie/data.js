

const generateFixedOrderColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hash = i * 2654435761 % 2 ** 32; // 使用简单的哈希函数
    const color = `#${hash.toString(16).slice(0, 6)}`; // 将哈希值转换为颜色
    if (color.length > 4) {
      colors.push(color);
    }
  }
  return colors;
}

export const chartColor = generateFixedOrderColors(1000)

// export const chartColor = [
//   "#27005D", '#9400FF', '#FF9B82', '#213555', '#4F709C', '#FFA1F5', '#016A70', '#952323', '#016A70', '#9D44C0', '#9A3B3B', '#183D3D', '#FF6969', '#9EB384', '#BB2525', '#337CCF', '#279EFF', '#504099', '#E19898', '#F79BD3', '#461959', '#3E001F', '#75C2F6', '#4E4FEB', '#3F2305', '#FF6666', '#F86F03', '#85A389', '#606C5D', '#FF0060'
// ]
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