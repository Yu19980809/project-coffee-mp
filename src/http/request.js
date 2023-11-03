import Taro from '@tarojs/taro'
import config from '../config'
import responseInterceptor from '../http/interceptors'

Taro.addInterceptor(responseInterceptor)

const request = (url, method = 'GET', params = {}, needToken = true, isFullUrl = false, header = null) => {
  const {contentType = 'application/json'} = header || {}

  const option = {
    url: isFullUrl ? url : (config.baseUrl + url),
    method,
    data: method === 'GET' ? {} : params,
    header: {'Content-Type': contentType},
    timeout: 30000
  }

  // 处理 token
  if (needToken) {
    const token = Taro.getStorageSync('accessToken')

    if (token) {
      option['header']['Authorization'] = token
    } else {
      Taro.setStorageSync('profile', null)
      Taro.showToast({
        title: '请登录',
        icon: 'error',
        duration: 2000
      })

      return
    }
  }

  return Taro.request(option)
}

export default request
