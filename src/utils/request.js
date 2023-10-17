import Taro from '@tarojs/taro'

const baseURL = 'http://localhost:4000/api/v1'

const request = (url, method = 'GET', data = {}, needToken = true) => {
  const _url = baseURL + url
  const _contentType = method === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json'
  let _header = { 'Content-Type': _contentType }

  // 需要携带 token 的请求，进行 token 获取
  if (needToken) {
    const token = Taro.getStorageSync('accessToken')

    if (token) {
      _header['Authorization'] = token
    } else {
      Taro.showToast({
        title: '请登录',
        icon: 'error',
        duration: 2000
      })

      return false
    }
  }

  return new Promise((resolve, reject) => {
    Taro.request({
      url: _url,
      header: _header,
      method,
      data,
      success(res) { resolve(res.data) },
      fail(err) { reject(err) }
    })
  })
}

export default request
