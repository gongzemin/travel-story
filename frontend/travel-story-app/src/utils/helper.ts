export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email)
}

// 获取 名字的首字母缩写（最多两个字母） 适用于头像缩写、用户名标识等场景
// getInitials("John Doe")          // "JD"
export const getInitials = (name: string): string => {
  if (!name) return ''
  const words = name.split(' ')
  let initials = ''
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0]
  }
  return initials.toUpperCase()
}

export const getEmptyCardMessage = (filterType: string): string => {
  switch (filterType) {
    case 'search':
      return '当前查询条件暂无数据！'
    case 'date':
      return '当前日期范围暂无数据！'
    default:
      return '暂无数据，点击右下角的按钮添加故事'
  }
}
