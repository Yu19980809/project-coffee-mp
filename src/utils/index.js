import Taro from '@tarojs/taro'

// 显示Modal
const showModal = ( content, callback ) => {
  Taro.showModal( {
    content,
    confirmColor: '#87451b',
    success: res => {
      if ( res.cancel ) return false
      if ( res.confirm ) {
        callback()
        return true
      }
    }
  } )
}

// 格式化时间（YYYY-MM-DD hh:mm:ss）
const formatDate = date => {
  date = new Date( date )
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 格式化数字，在个位数前面添加一个0
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 判断两个['string', 'string']类型数组是否相等
const isEqualArr = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false
  if (arr1.length === 0 && arr2.length === 0) return true

  arr1.sort()
  arr2.sort()
  return arr1.every((value, index) => value === arr2[index])
}

export {
  showModal,
  formatDate,
  isEqualArr
}