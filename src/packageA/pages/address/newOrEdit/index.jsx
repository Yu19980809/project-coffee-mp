import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Text, Input, Button, Switch } from '@tarojs/components'
import { addAddress, fetchAddressInfo, updateAddressInfo } from '@/api/v1'

const New = () => {
  const initialAddressInfo = {
    name: '',
    tel: '',
    location: '',
    door: '',
    is_default: false
  }
  const [ addressInfo, setAddressInfo ] = useState( initialAddressInfo )
  const [pageType, setPageType] = useState('add')
  const [addressId, setAddressId] = useState('')

  // 获取路由参数
  useEffect(() => {
    const {type, id} = Taro.getCurrentInstance().router.params
    if (type === 'edit') {
      Taro.setNavigationBarTitle({title: 'Edit Address'})
      setPageType('edit')
      setAddressId(id)
      fetchAddressInfo(id).then(res => setAddressInfo(res.data))
    }
  }, [])

  // 保存地址信息
  const handleSubmit = () => {
    if (pageType === 'add') {
      addAddress(addressInfo)
        .then(() => {
          setAddressInfo(initialAddressInfo)
          Taro.navigateTo({url: '/packageA/pages/address/show/index'})
        })
    } else {
      updateAddressInfo({addressId, addressInfo})
        .then(() => {
          setAddressInfo(initialAddressInfo)
          Taro.navigateTo({url: '/packageA/pages/address/show/index'})
        })
    }
  }

  return (
    <View className='relative h-screen'>
      {/* 信息部分 */}
      <View className='bg-white'>
        <View className='flex items-center gap-[24rpx] p-[32rpx] border-b border-primary-400'>
          <Text>联系人</Text>
          <Input
            type='text'
            placeholder='用于取餐时对您的称呼'
            // value={addressInfo.name}
            onBlur={e => setAddressInfo( { ...addressInfo, name: e.detail.value } )}
          />
        </View>

        <View className='flex items-center gap-[24rpx] p-[32rpx] border-b border-primary-400'>
          <Text>手机号</Text>
          <Input
            type='text'
            placeholder='请输入您的手机号'
            // value={addressInfo.tel}
            onBlur={e => setAddressInfo( { ...addressInfo, tel: e.detail.value } )}
          />
        </View>

        <View className='flex items-center gap-[24rpx] p-[32rpx] border-b border-primary-400'>
          <Text>地址</Text>
          <Input
            type='text'
            placeholder='请输入收货地址'
            // value={addressInfo.location}
            onBlur={e => setAddressInfo( { ...addressInfo, location: e.detail.value } )}
          />
        </View>

        <View className='flex items-center gap-[24rpx] p-[32rpx] border-b border-primary-400'>
          <Text>门牌号</Text>
          <Input
            type='text'
            placeholder='例：2号楼801室'
            // value={addressInfo.door}
            onBlur={e => setAddressInfo( { ...addressInfo, door: e.detail.value } )}
          />
        </View>

        <View className='flex justify-between items-center p-[32rpx]'>
          <Text>默认地址</Text>
          <Switch
            style='width: 100rpx; height: 60rpx'
            // checked={addressInfo.is_default === 'yes'}
            onChange={e => setAddressInfo( { ...addressInfo, is_default: e.detail.value ? 'yes' : 'no' } )}
          />
        </View>
      </View>

      {/* 提交按钮 */}
      <View className='absolute bottom-[32rpx] left-0 flex justify-center items-center w-full h-[80rpx]'>
        <Button
          className='w-[80%] py-[16rpx] text-center text-primary-100 bg-primary-700 rounded-full'
          onClick={handleSubmit}
        >
          保存
        </Button>
      </View>
    </View>
  )
}

export default New