import request from '@/utils/request'

// 首页
export const fetchTop3Drinks = () => request('/commodity/weapp/top3', 'GET', {}, false)

// 地址
export const fetchAllAddresses = () => request('/address/weapp', 'GET', {})
export const addAddress = data => request('/address/weapp', 'POST', data)
export const fetchAddressInfo = id => request(`/address/weapp/${id}`, 'GET', {})
export const updateAddressInfo = data => request('/address/weapp', 'PATCH', data)

// 门店
export const fetchAllShops = () => request('/shop/weapp', 'GET', {}, false)

// 我的
export const login = data => request('/auth/login/weapp', 'POST', data, false)
export const updateUserInfo = data => request('/user/weapp', 'PATCH', data)
export const fetchUploadParams = () => request('/aliyun/weapp', 'GET', {})

// 菜单
export const fetchAllCategories = () => request('/category/weapp', 'GET', {}, false)
export const fetchAllCommodities = () => request('/commodity/weapp', 'GET', {}, false)
export const fetchDefaultAddress = () => request('/address/weapp/default', 'GET', {})
export const fetchNearestShop = () => request('/shop/weapp/nearest', 'GET', {}, false)

// 支付
export const generateOrder = data => request('/order/weapp', 'POST', data)

// 订单
export const fetchAllOrders = () => request('/order-commodity/weapp', 'GET', {})
