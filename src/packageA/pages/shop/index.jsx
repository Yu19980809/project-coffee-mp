import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { fetchAllShops } from '@/api/v1'

// 门店卡片
const ShopCard = ( { name, location, handleClick } ) => (
  <View
    className='flex justify-between items-center px-[32rpx] py-[24rpx] bg-white rounded-[32rpx]'
    onClick={() => handleClick( { location, name } )}
  >
    <View className='flex flex-col gap-[16rpx]'>
      <View className='flex justify-between items-center'>
        <Text className='text-primary-700'>{ name }</Text>
        <Text className='text-[24rpx]'>{ location }</Text>
      </View>
    </View>
  </View>
)

const Address = () => {
  // 地址列表
  const [shopList, setShopList] = useState([] )

  // 获取用户收货地址
  useEffect(() => {
    fetchAllShops().then(res => setShopList(res.data))
  }, [])

  // 选中门店
  const handleClick = params => {
    Taro.preload({routeType: 'reselectShop', shop: params})
    Taro.navigateBack({delta: 1})
  }

  return (
    <View className='h-full'>
      {/* 地址列表 */}
      <View className='h-[calc(100vh-120rpx)] p-[32rpx]'>
        {/* 提示 */}
        <View className={`${ !shopList.length ? '' : 'hidden' } w-full h-full flex flex-col justify-center items-center gap-[16rpx]`}>
          <View className='w-[300rpx] h-[300rpx] bg-dimWhite rounded-[40rpx]' />
          <Text className='text-primary-400'>暂无门店</Text>
        </View>

        {/* 列表 */}
        <View className='flex flex-col gap-[32rpx]'>
          { shopList.map( item => (
            <ShopCard
              key={item._id}
              handleClick={handleClick}
              {...item}
            />
          ) ) }
        </View>
      </View>
    </View>
  )
}

export default Address